"use client";

import { QuestionField } from "@/components/survey/question-field";
import type { SurveyQuestion } from "@/lib/survey-types";
import { cn } from "@/lib/utils";

export function LikertScaleQuestion({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: number | null;
  error?: string;
  onChange: (value: number) => void;
}) {
  const [lowLabel, highLabel] = question.scaleLabels ?? ["低い", "高い"];

  return (
    <QuestionField
      id={question.id}
      label={question.label}
      helperText={question.helperText}
      required={question.required}
      error={error}
    >
      <div className="rounded-3xl border border-border/80 bg-background p-4">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => onChange(scale)}
              className={cn(
                "rounded-2xl border px-0 py-4 text-sm font-medium transition-colors",
                value === scale
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
    </QuestionField>
  );
}
