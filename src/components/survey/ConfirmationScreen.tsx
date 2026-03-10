import { SurveyAnswersSummary } from "@/components/survey/SurveyAnswersSummary";
import type { SurveyAnswers } from "@/lib/survey-types";
import { Button } from "@/components/ui/button";

export function ConfirmationScreen({
  answers,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  answers: SurveyAnswers;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-8">
      <SurveyAnswersSummary
        answers={answers}
        badgeLabel="確認画面"
        title="送信前に内容を確認"
        description="回答はこのあと送信されます。厳しめの意見でもそのままで構いません。"
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          修正する
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "この内容で送信する"}
        </Button>
      </div>
    </div>
  );
}
