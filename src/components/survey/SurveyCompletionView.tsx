"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SurveyAnswersSummary } from "@/components/survey/SurveyAnswersSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SURVEY_COMPLETED_STORAGE_KEY,
  type CompletedSurveyRecord,
} from "@/lib/survey-client-storage";
import type { SurveyAnswers } from "@/lib/survey-types";
import { formatDateTime } from "@/lib/utils";

type SessionPayload = {
  respondentCode: string;
  response: {
    status: "in_progress" | "submitted";
    submittedAt?: string | null;
    answers: SurveyAnswers;
  };
};

export function SurveyCompletionView() {
  const [record, setRecord] = useState<CompletedSurveyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCompletedAnswers() {
      const localRecordRaw = window.localStorage.getItem(SURVEY_COMPLETED_STORAGE_KEY);
      const localRecord = localRecordRaw
        ? (JSON.parse(localRecordRaw) as CompletedSurveyRecord | null)
        : null;

      if (localRecord) {
        if (mounted) {
          setRecord(localRecord);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/survey/session", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("回答内容の取得に失敗しました。");
        }

        const payload = (await response.json()) as SessionPayload;
        if (!mounted) return;

        if (payload.response.status === "submitted") {
          setRecord({
            respondentCode: payload.respondentCode,
            submittedAt: payload.response.submittedAt ?? new Date().toISOString(),
            answers: payload.response.answers,
          });
        }
      } catch {
        if (mounted) {
          setRecord(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCompletedAnswers();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="space-y-6 p-8 sm:p-10">
          <Badge variant="success">回答完了</Badge>
          <div className="space-y-3">
            <h1 className="font-serif text-4xl tracking-tight text-foreground">ありがとうございました</h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              回答は保存されました。厳しめのフィードバックも含めて、次の改善にそのまま使います。
            </p>
          </div>
          <div className="rounded-3xl bg-secondary px-5 py-4 text-sm leading-7 text-secondary-foreground">
            個人が特定される形では扱わず、体験改善のための集計と分析に利用します。
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/">トップへ戻る</Link>
            </Button>
            <Button asChild>
              <Link href="#submitted-answers">回答内容を見る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-8">
            <Badge variant="outline">回答控え</Badge>
            <p className="text-sm leading-7 text-muted-foreground">回答内容を読み込んでいます...</p>
          </CardContent>
        </Card>
      ) : record ? (
        <div id="submitted-answers" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            この端末では {formatDateTime(record.submittedAt)} に回答済みです。
          </p>
          <SurveyAnswersSummary
            answers={record.answers}
            badgeLabel="回答控え"
            title="送信した内容"
            description="この端末から送信した回答を確認できます。後で見返したい時は、この画面を開いてください。"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-3 p-8">
            <Badge variant="outline">回答控え</Badge>
            <p className="text-sm leading-7 text-muted-foreground">
              回答内容の表示はこの端末の保存情報から行っています。別の端末から開いた場合は表示されないことがあります。
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
