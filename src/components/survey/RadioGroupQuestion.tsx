"use client";

import { QuestionField } from "@/components/survey/question-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SurveyQuestion } from "@/lib/survey-types";

export function RadioGroupQuestion({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: string | null;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <QuestionField
      id={question.id}
      label={question.label}
      helperText={question.helperText}
      required={question.required}
      error={error}
    >
      <RadioGroup value={value ?? ""} onValueChange={onChange} className="space-y-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/80 bg-background px-4 py-4 transition-colors hover:bg-accent/60"
          >
            <RadioGroupItem id={`${question.id}-${option.value}`} value={option.value} />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-foreground">{option.label}</span>
              {option.description ? (
                <span className="block text-sm text-muted-foreground">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </RadioGroup>
    </QuestionField>
  );
}
