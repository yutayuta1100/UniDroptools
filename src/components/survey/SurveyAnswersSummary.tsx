import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surveySections } from "@/config/survey";
import { formatAnswerValue } from "@/lib/answer-helpers";
import type { SurveyAnswers } from "@/lib/survey-types";

export function SurveyAnswersSummary({
  answers,
  badgeLabel,
  title,
  description,
}: {
  answers: SurveyAnswers;
  badgeLabel: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="outline">{badgeLabel}</Badge>
        <h2 className="font-serif text-3xl tracking-tight text-foreground">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>

      <div className="space-y-6">
        {surveySections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.questions.map((question) => (
                <div
                  key={question.id}
                  className="space-y-2 border-b border-border/60 pb-4 last:border-none last:pb-0"
                >
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
    </div>
  );
}
