import { surveyQuestions } from "@/config/survey";
import { buildResponseSummary, type ResponseWithScores } from "@/lib/analytics";
import { formatAnswerValue } from "@/lib/answer-helpers";

function escapeCsv(value: unknown) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function buildCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ];
  return lines.join("\n");
}

export function buildRawCsv(responses: ResponseWithScores[]) {
  const rows = responses.flatMap((response) =>
    surveyQuestions.map((question) => ({
      response_id: response.id,
      respondent_code: response.respondentCode,
      status: response.status,
      started_at: response.startedAt,
      submitted_at: response.submittedAt ?? "",
      question_id: question.id,
      question_label: question.label,
      question_type: question.type,
      answer_value: formatAnswerValue(question.id, response.answers[question.id] ?? null),
      answer_text:
        typeof response.answers[question.id] === "string" ? response.answers[question.id] : "",
      tags: response.tags
        .filter((tag) => tag.questionId === question.id)
        .map((tag) => `${tag.tagType}:${tag.tagValue}`)
        .join(" | "),
    })),
  );

  return buildCsv(rows);
}

export function buildAnalysisCsv(responses: ResponseWithScores[]) {
  const rows = responses.map((response) => {
    const summary = buildResponseSummary(response);

    return {
      response_id: response.id,
      respondent_code: response.respondentCode,
      status: response.status,
      started_at: response.startedAt,
      submitted_at: response.submittedAt ?? "",
      caution_reduction_score: response.scores.cautionReduction?.toFixed(1) ?? "",
      diagnosis_load_score: response.scores.diagnosisLoad?.toFixed(1) ?? "",
      drop_delight_score: response.scores.dropDelight?.toFixed(1) ?? "",
      chat_friction_score: response.scores.chatFriction?.toFixed(1) ?? "",
      safety_score: response.scores.safety?.toFixed(1) ?? "",
      referral_score: response.scores.referral?.toFixed(1) ?? "",
      negative_intensity: response.scores.negativeIntensity,
      nps: summary.nps ?? "",
      diagnosis_satisfaction: summary.diagnosisSatisfaction ?? "",
      drop_first_impression: summary.dropFirstImpression ?? "",
      chat_ease: summary.chatEase ?? "",
      comfort_score: summary.comfortScore?.toFixed(1) ?? "",
      tags: response.tags.map((tag) => `${tag.questionId}:${tag.tagType}:${tag.tagValue}`).join(" | "),
      ...Object.fromEntries(
        surveyQuestions.map((question) => [
          question.id,
          formatAnswerValue(question.id, response.answers[question.id] ?? null),
        ]),
      ),
    };
  });

  return buildCsv(rows);
}
