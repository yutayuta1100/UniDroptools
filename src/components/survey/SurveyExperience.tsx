"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationScreen } from "@/components/survey/ConfirmationScreen";
import { ProgressHeader } from "@/components/survey/ProgressHeader";
import { SectionIntro } from "@/components/survey/SectionIntro";
import { StickyNavigation } from "@/components/survey/StickyNavigation";
import { SurveyQuestionRenderer } from "@/components/survey/SurveyQuestionRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { surveySections } from "@/config/survey";
import type { QuestionValue, SurveyAnswers } from "@/lib/survey-types";
import { formatDateTime } from "@/lib/utils";
import { isEmptyAnswer, validateSectionAnswers } from "@/lib/validation";

type SessionResponse = {
  respondentCode: string;
  response: {
    status: "in_progress" | "submitted";
    answers: SurveyAnswers;
    metadata: Record<string, unknown>;
  };
};

const LOCAL_STORAGE_KEY = "unidrop-survey-draft";

function getFirstIncompleteSectionIndex(answers: SurveyAnswers) {
  return surveySections.findIndex((section) =>
    section.questions.some((question) => question.required && isEmptyAnswer(answers[question.id] ?? null)),
  );
}

export function SurveyExperience() {
  const router = useRouter();
  const [respondentCode, setRespondentCode] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [mode, setMode] = useState<"survey" | "review">("survey");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentSection = surveySections[currentSectionIndex];

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/survey/session", { cache: "no-store" });
        const payload = (await response.json()) as SessionResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "セッション取得に失敗しました。");
        }

        if (!mounted) return;

        const localDraftRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        const localDraft = localDraftRaw ? (JSON.parse(localDraftRaw) as SessionResponse | null) : null;
        const mergedAnswers =
          localDraft && localDraft.respondentCode === payload.respondentCode
            ? { ...payload.response.answers, ...localDraft.response.answers }
            : payload.response.answers;

        setRespondentCode(payload.respondentCode);
        setAnswers(mergedAnswers);
        setHasUnsavedChanges(false);

        if (payload.response.status === "submitted") {
          router.replace("/survey/complete");
          return;
        }

        const lastSavedSectionKey =
          typeof payload.response.metadata.lastSavedSectionKey === "string"
            ? payload.response.metadata.lastSavedSectionKey
            : null;

        const sectionFromMetadata = lastSavedSectionKey
          ? surveySections.findIndex((section) => section.key === lastSavedSectionKey)
          : -1;
        const fallbackIndex = getFirstIncompleteSectionIndex(mergedAnswers);

        setCurrentSectionIndex(
          sectionFromMetadata >= 0
            ? sectionFromMetadata
            : fallbackIndex >= 0
              ? fallbackIndex
              : 0,
        );
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "読み込みに失敗しました。");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!respondentCode) return;

    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        respondentCode,
        response: {
          status: "in_progress",
          answers,
          metadata: {},
        },
      }),
    );
  }, [answers, respondentCode]);

  useEffect(() => {
    if (!hasUnsavedChanges || mode !== "survey" || isSubmitting) return undefined;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isSubmitting, mode]);

  const completionPercent = useMemo(() => {
    if (mode === "review") return 100;
    return ((currentSectionIndex + 1) / surveySections.length) * 100;
  }, [currentSectionIndex, mode]);

  async function persistSection(completeSection: boolean, showSuccessToast = false) {
    if (!respondentCode) return false;

    setPageError(null);
    const sectionAnswers = Object.fromEntries(
      currentSection.questions.map((question) => [question.id, answers[question.id] ?? null]),
    );

    const response = await fetch("/api/survey/section", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        respondentCode,
        sectionKey: currentSection.key,
        answers: sectionAnswers,
        completeSection,
      }),
    });
    const payload = (await response.json()) as {
      error?: string;
      errors?: Record<string, string>;
      response?: { answers: SurveyAnswers };
    };

    if (!response.ok) {
      if (payload.errors) {
        setErrors(payload.errors);
      }
      const message = payload.error ?? "保存に失敗しました。";
      setPageError(message);
      toast.error(message);
      return false;
    }

    setErrors({});
    setLastSavedAt(new Date().toISOString());
    setHasUnsavedChanges(false);
    if (payload.response?.answers) {
      setAnswers(payload.response.answers);
    }
    if (showSuccessToast) {
      toast.success("このセクションを保存しました。");
    }
    return true;
  }

  function handleAnswerChange(questionId: string, value: QuestionValue) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
    setHasUnsavedChanges(true);

    if (errors[questionId]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
    }
  }

  function handleNext() {
    const nextErrors = validateSectionAnswers(
      currentSection.questions.map((question) => question.id),
      answers,
      true,
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const saved = await persistSection(true);
      if (!saved) return;

      if (currentSectionIndex === surveySections.length - 1) {
        setMode("review");
        return;
      }

      setCurrentSectionIndex((index) => Math.min(index + 1, surveySections.length - 1));
    });
  }

  function handleSaveDraft() {
    startTransition(async () => {
      await persistSection(false, true);
    });
  }

  function handleSubmit() {
    if (!respondentCode) return;

    setIsSubmitting(true);
    setPageError(null);

    fetch("/api/survey/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        respondentCode,
        answers,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          error?: string;
          errors?: Record<string, string>;
        };

        if (!response.ok) {
          if (payload.errors) {
            const firstQuestionId = Object.keys(payload.errors)[0];
            const sectionIndex = surveySections.findIndex((section) =>
              section.questions.some((question) => question.id === firstQuestionId),
            );

            if (sectionIndex >= 0) {
              setCurrentSectionIndex(sectionIndex);
              setMode("survey");
            }
            setErrors(payload.errors);
          }

          throw new Error(payload.error ?? "送信に失敗しました。");
        }

        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        setHasUnsavedChanges(false);
        toast.success("回答を送信しました。");
        router.push("/survey/complete");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "送信に失敗しました。";
        setPageError(message);
        toast.error(message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          回答データを準備しています...
        </div>
      </div>
    );
  }

  if (pageError && !respondentCode) {
    return (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-serif text-2xl text-foreground">回答画面を準備できませんでした</h2>
            <p className="text-sm leading-7 text-muted-foreground">{pageError}</p>
            <p className="text-sm leading-7 text-muted-foreground">
              少し時間をおいて再読み込みしてください。
            </p>
          </CardContent>
        </Card>
      );
  }

  if (mode === "review") {
    return (
      <div className="space-y-6">
        {pageError ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : null}
        <ConfirmationScreen
          answers={answers}
          onBack={() => setMode("survey")}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <ProgressHeader
        currentSection={currentSectionIndex + 1}
        totalSections={surveySections.length}
        title={currentSection.title}
        completionPercent={completionPercent}
        savedAtLabel={
          hasUnsavedChanges
            ? "未保存の変更があります"
            : lastSavedAt
              ? `${formatDateTime(lastSavedAt)} に保存`
              : undefined
        }
      />

      <div className="space-y-8 px-4 sm:px-6">
        <SectionIntro
          index={currentSection.sortOrder}
          title={currentSection.title}
          estimatedMinutes={currentSection.estimatedMinutes}
          description={currentSection.description}
        />

        {pageError ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : null}

        <div className="space-y-6">
          {currentSection.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-5 sm:p-6">
                <SurveyQuestionRenderer
                  question={question}
                  value={answers[question.id] ?? null}
                  error={errors[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StickyNavigation
        canGoBack={currentSectionIndex > 0}
        canGoNext
        isLastSection={currentSectionIndex === surveySections.length - 1}
        isSaving={isPending}
        onBack={() => {
          setErrors({});
          setCurrentSectionIndex((index) => Math.max(0, index - 1));
        }}
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
      />
    </div>
  );
}
