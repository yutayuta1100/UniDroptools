export type QuestionOption = {
  value: string;
  label: string;
  description?: string;
};

export type QuestionType =
  | "radio"
  | "checkbox"
  | "likert"
  | "nps"
  | "textarea"
  | "shortText";

export type QuestionOptionLayout = "stack" | "grid";

export type QuestionValue = string | string[] | number | boolean | null;

export type SurveyQuestion = {
  id: string;
  type: QuestionType;
  required: boolean;
  label: string;
  helperText?: string;
  options?: QuestionOption[];
  placeholder?: string;
  maxSelections?: number;
  minSelections?: number;
  scaleLabels?: [string, string];
  allowNotUsed?: boolean;
  rows?: number;
  suggestions?: string[];
  optionLayout?: QuestionOptionLayout;
};

export type SurveySection = {
  id: string;
  key: string;
  title: string;
  sortOrder: number;
  estimatedMinutes: string;
  description: string[];
  questions: SurveyQuestion[];
};

export type SurveyConfig = SurveySection[];

export type SurveyAnswers = Record<string, QuestionValue>;

export type ResponseStatus = "in_progress" | "submitted";

export type AnalysisTagType = "sentiment" | "topic" | "priority" | "custom";

export type SectionSavePayload = {
  sectionKey: string;
  answers: SurveyAnswers;
};
