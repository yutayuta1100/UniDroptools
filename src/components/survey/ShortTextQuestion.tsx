"use client";

import { QuestionField } from "@/components/survey/question-field";
import { Input } from "@/components/ui/input";
import type { SurveyQuestion } from "@/lib/survey-types";

export function ShortTextQuestion({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: string;
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
      <Input
        id={question.id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
      />
    </QuestionField>
  );
}
