import type { SurveyAnswers } from "@/lib/survey-types";

export const SURVEY_DRAFT_STORAGE_KEY = "unidrop-survey-draft";
export const SURVEY_COMPLETED_STORAGE_KEY = "unidrop-survey-complete";

export type CompletedSurveyRecord = {
  respondentCode: string;
  submittedAt: string;
  answers: SurveyAnswers;
};
