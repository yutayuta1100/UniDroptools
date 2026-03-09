"use client";

import { QuestionField } from "@/components/survey/question-field";
import { Textarea } from "@/components/ui/textarea";
import type { SurveyQuestion } from "@/lib/survey-types";

export function TextareaQuestion({
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
      <Textarea
        id={question.id}
        rows={question.rows ?? 5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
      />
    </QuestionField>
  );
}
