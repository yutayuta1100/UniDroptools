import { z } from "zod";

import { surveyQuestionMap } from "@/config/survey";
import type { QuestionValue, SurveyAnswers, SurveyQuestion } from "@/lib/survey-types";

export function normalizeAnswerValue(
  question: SurveyQuestion,
  rawValue: unknown,
): QuestionValue {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  switch (question.type) {
    case "checkbox": {
      const value = Array.isArray(rawValue) ? rawValue : [rawValue];
      const normalized = value
        .map((item) => String(item).trim())
        .filter(Boolean);
      return normalized.length > 0 ? normalized : null;
    }
    case "likert":
    case "nps": {
      const numberValue =
        typeof rawValue === "number" ? rawValue : Number.parseInt(String(rawValue), 10);
      return Number.isNaN(numberValue) ? null : numberValue;
    }
    case "radio":
    case "shortText":
    case "textarea": {
      const value = String(rawValue).trim();
      return value.length > 0 ? value : null;
    }
    default:
      return null;
  }
}

export function isEmptyAnswer(value: QuestionValue) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

export function validateQuestionValue(
  question: SurveyQuestion,
  value: QuestionValue,
  enforceRequired = true,
) {
  if (isEmptyAnswer(value)) {
    return enforceRequired && question.required ? "この項目は回答が必要です。" : null;
  }

  switch (question.type) {
    case "checkbox": {
      if (!Array.isArray(value)) {
        return "複数選択の形式が正しくありません。";
      }
      const { minSelections, maxSelections } = question;

      if (minSelections && value.length < minSelections) {
        return `${minSelections}個以上選択してください。`;
      }

      if (maxSelections && value.length > maxSelections) {
        return `${maxSelections}個まで選択できます。`;
      }

      return null;
    }
    case "likert": {
      if (typeof value !== "number" || value < 1 || value > 5) {
        return "1から5の範囲で選択してください。";
      }
      return null;
    }
    case "nps": {
      if (typeof value !== "number" || value < 0 || value > 10) {
        return "0から10の範囲で選択してください。";
      }
      return null;
    }
    case "radio": {
      if (typeof value !== "string") {
        return "選択形式が正しくありません。";
      }
      if (question.options && question.options.length > 0) {
        const validValues = new Set(question.options.map((option) => option.value));
        if (!validValues.has(value)) {
          return "選択肢の値が不正です。";
        }
      }
      return null;
    }
    case "shortText":
    case "textarea": {
      if (typeof value !== "string") {
        return "入力形式が正しくありません。";
      }
      return value.trim().length === 0 && question.required
        ? "内容を入力してください。"
        : null;
    }
    default:
      return null;
  }
}

export function validateSectionAnswers(
  questionIds: string[],
  answers: SurveyAnswers,
  enforceRequired = true,
) {
  return questionIds.reduce<Record<string, string>>((errors, questionId) => {
    const question = surveyQuestionMap[questionId];
    if (!question) return errors;

    const normalized = normalizeAnswerValue(question, answers[questionId]);
    const error = validateQuestionValue(question, normalized, enforceRequired);

    if (error) {
      errors[questionId] = error;
    }

    return errors;
  }, {});
}

export const sectionSaveSchema = z.object({
  respondentCode: z.string().min(8),
  sectionKey: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
  completeSection: z.boolean().optional().default(false),
});

export const submitSurveySchema = z.object({
  respondentCode: z.string().min(8),
  answers: z.record(z.string(), z.unknown()),
});
