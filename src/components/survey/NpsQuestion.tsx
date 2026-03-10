"use client";

import { QuestionField } from "@/components/survey/question-field";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "@/lib/survey-types";

export function NpsQuestion({
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
  return (
    <QuestionField
      id={question.id}
      label={question.label}
      helperText={question.helperText}
      required={question.required}
      error={error}
    >
      <div className="space-y-4 rounded-3xl border border-border/80 bg-background p-4">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(index)}
              className={cn(
                "rounded-2xl border px-0 py-4 text-sm font-medium transition-colors",
                value === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {index}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <span>勧めたくない</span>
          <span>勧めたい</span>
        </div>
      </div>
    </QuestionField>
  );
}
