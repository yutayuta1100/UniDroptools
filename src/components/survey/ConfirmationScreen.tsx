import { surveySections } from "@/config/survey";
import { formatAnswerValue } from "@/lib/answer-helpers";
import type { SurveyAnswers } from "@/lib/survey-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="space-y-3">
        <Badge variant="outline">確認画面</Badge>
        <h2 className="font-serif text-3xl tracking-tight text-foreground">送信前に内容を確認</h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          回答はこのあと送信されます。厳しめの意見でもそのままで構いません。
        </p>
      </div>

      <div className="space-y-6">
        {surveySections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.questions.map((question) => (
                <div key={question.id} className="space-y-2 border-b border-border/60 pb-4 last:border-none last:pb-0">
                  <p className="text-sm font-medium text-foreground">{question.label}</p>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {formatAnswerValue(question.id, answers[question.id] ?? null)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

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
