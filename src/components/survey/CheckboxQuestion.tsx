"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { QuestionField } from "@/components/survey/question-field";
import type { SurveyQuestion } from "@/lib/survey-types";

export function CheckboxQuestion({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
}) {
  return (
    <QuestionField
      id={question.id}
      label={question.label}
      helperText={question.helperText}
      required={question.required}
      error={error}
    >
      <div className="space-y-3">
        {question.options?.map((option) => {
          const checked = value.includes(option.value);
          const disabled =
            !checked &&
            typeof question.maxSelections === "number" &&
            value.length >= question.maxSelections;

          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/80 bg-background px-4 py-4 transition-colors hover:bg-accent/60 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
              data-disabled={disabled}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(nextChecked) => {
                  if (nextChecked) {
                    const nextValue = Array.from(new Set([...value, option.value]));
                    onChange(nextValue);
                  } else {
                    onChange(value.filter((item) => item !== option.value));
                  }
                }}
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                {option.description ? (
                  <span className="block text-sm text-muted-foreground">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </QuestionField>
  );
}
