"use client";

import { CheckboxQuestion } from "@/components/survey/CheckboxQuestion";
import { LikertScaleQuestion } from "@/components/survey/LikertScaleQuestion";
import { NpsQuestion } from "@/components/survey/NpsQuestion";
import { RadioGroupQuestion } from "@/components/survey/RadioGroupQuestion";
import { ShortTextQuestion } from "@/components/survey/ShortTextQuestion";
import { TextareaQuestion } from "@/components/survey/TextareaQuestion";
import type { QuestionValue, SurveyQuestion } from "@/lib/survey-types";

export function SurveyQuestionRenderer({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: QuestionValue;
  error?: string;
  onChange: (value: QuestionValue) => void;
}) {
  switch (question.type) {
    case "radio":
      return (
        <RadioGroupQuestion
          question={question}
          value={typeof value === "string" ? value : null}
          error={error}
          onChange={onChange}
        />
      );
    case "checkbox":
      return (
        <CheckboxQuestion
          question={question}
          value={Array.isArray(value) ? value : []}
          error={error}
          onChange={onChange}
        />
      );
    case "likert":
      return (
        <LikertScaleQuestion
          question={question}
          value={typeof value === "number" ? value : null}
          error={error}
          onChange={onChange}
        />
      );
    case "nps":
      return (
        <NpsQuestion
          question={question}
          value={typeof value === "number" ? value : null}
          error={error}
          onChange={onChange}
        />
      );
    case "textarea":
      return (
        <TextareaQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          error={error}
          onChange={onChange}
        />
      );
    case "shortText":
      return (
        <ShortTextQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          error={error}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}
