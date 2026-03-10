import { surveyQuestionMap } from "@/config/survey";
import type { QuestionValue } from "@/lib/survey-types";
import type { StoredResponse } from "@/lib/survey-store";

export function getAnswer(response: StoredResponse, questionId: string): QuestionValue {
  return response.answers[questionId] ?? null;
}

export function getNumberAnswer(response: StoredResponse, questionId: string) {
  const value = getAnswer(response, questionId);
  return typeof value === "number" ? value : null;
}

export function getStringAnswer(response: StoredResponse, questionId: string) {
  const value = getAnswer(response, questionId);
  return typeof value === "string" ? value : null;
}

export function getArrayAnswer(response: StoredResponse, questionId: string) {
  const value = getAnswer(response, questionId);
  return Array.isArray(value) ? value : [];
}

export function getOptionLabel(questionId: string, value: string) {
  const question = surveyQuestionMap[questionId];
  return question?.options?.find((option) => option.value === value)?.label ?? value;
}

export function formatAnswerValue(questionId: string, value: QuestionValue): string {
  const question = surveyQuestionMap[questionId];

  if (value === null || value === undefined) return "未回答";
  if (Array.isArray(value)) {
    return value.map((item) => getOptionLabel(questionId, item)).join(" / ");
  }
  if (typeof value === "number") {
    if (question?.type === "nps") return `${value}`;
    return `${value}`;
  }
  if (typeof value === "string" && question?.options?.length) {
    return getOptionLabel(questionId, value);
  }
  return String(value);
}
