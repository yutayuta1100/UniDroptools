import { surveyQuestionMap, surveySections } from "@/config/survey";
import { getArrayAnswer, getNumberAnswer, getStringAnswer } from "@/lib/answer-helpers";
import {
  buildFreeTextEntries,
  buildTopicFrequency,
  calculateNegativeIntensity,
  classifySentiment,
  extractKeywords,
} from "@/lib/free-text";
import type { StoredResponse } from "@/lib/survey-store";
import { average, clamp } from "@/lib/utils";

export type ResponseScores = {
  cautionReduction: number | null;
  diagnosisLoad: number | null;
  dropDelight: number | null;
  chatFriction: number | null;
  safety: number | null;
  referral: number | null;
  negativeIntensity: number;
};

export type DashboardData = {
  totals: {
    totalResponses: number;
    submittedResponses: number;
    completionRate: number;
    averageMinutes: number | null;
    averageNps: number | null;
    averageSignupEase: number | null;
    averageDiagnosisSatisfaction: number | null;
    averageChatEase: number | null;
    averageSafety: number | null;
    matchingAppRatio: number;
  };
  sectionFunnel: Array<{
    key: string;
    title: string;
    reached: number;
    completed: number;
    abandonRate: number;
  }>;
  distributions: {
    dropFirstImpression: Array<{ label: string; count: number }>;
    nps: Array<{ label: string; count: number }>;
    submissionTimeline: Array<{ date: string; count: number }>;
    likert: Array<{ questionId: string; label: string; average: number | null }>;
  };
  reasonHighlights: {
    promoters: string[];
    detractors: string[];
  };
  topicFrequency: Array<{ keyword: string; count: number }>;
};

export type ResponseWithScores = StoredResponse & {
  scores: ResponseScores;
};

export type ResponseFilters = {
  status?: "all" | "in_progress" | "submitted";
  gender?: string;
  grade?: string;
  matchingAppExperience?: string;
  impressionBeforeSignup?: string;
  dropFirstImpression?: string;
  npsBand?: "high" | "mid" | "low";
  noFacePhotoInterestBand?: "high" | "low";
  firstMessageEaseBand?: "high" | "low";
};

function toFiveScaleScore(value: number | null, reverse = false) {
  if (value === null) return null;
  const score = ((value - 1) / 4) * 100;
  return reverse ? 100 - score : score;
}

function mapValue<T extends string>(value: T | null, table: Record<T, number>) {
  if (!value) return null;
  return table[value] ?? null;
}

function countPenalty(selected: string[], negativeKeys: string[], base = 100) {
  const negatives = selected.filter((item) => negativeKeys.includes(item)).length;
  return clamp(base - negatives * 15, 0, 100);
}

function getProgressInfo(response: StoredResponse) {
  const completedSectionKeys = Array.isArray(response.metadata.completedSectionKeys)
    ? (response.metadata.completedSectionKeys as string[])
    : [];

  let highestReachedIndex = -1;
  let highestCompletedIndex = -1;

  surveySections.forEach((section, index) => {
    const hasAnswers = section.questions.some((question) => response.answers[question.id] !== undefined);
    if (hasAnswers) {
      highestReachedIndex = index;
    }

    const completedByMetadata = completedSectionKeys.includes(section.key);
    const completedByAnswers =
      response.status === "submitted" ||
      section.questions.every((question) => {
        if (!question.required) return true;
        const value = response.answers[question.id];
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && String(value).length > 0;
      });

    if (completedByMetadata || completedByAnswers) {
      highestCompletedIndex = index;
    }
  });

  return { highestReachedIndex, highestCompletedIndex };
}

export function computeResponseScores(response: StoredResponse): ResponseScores {
  const cautionReduction = average(
    [
      mapValue(getStringAnswer(response, "impression_before_signup"), {
        interesting_diagnosis: 82,
        campus_connection_service: 76,
        basically_matching_app: 28,
        unclear: 46,
        felt_suspicious: 16,
      }),
      countPenalty(getArrayAnswer(response, "concerns_before_signup"), [
        "noticed_by_acquaintances",
        "embarrassing",
        "felt_like_dating_service",
        "personal_data",
        "too_long_diagnosis",
        "awkward_after_match",
        "uncertain_user_base",
      ]),
      mapValue(getStringAnswer(response, "closest_category"), {
        matching_app: 18,
        romantic_values_service: 58,
        campus_connection_service: 88,
        diagnostic_content: 70,
        still_unclear: 40,
      }),
    ].filter((value): value is number => value !== null),
  );

  const diagnosisLoad = average(
    [
      mapValue(getStringAnswer(response, "diagnosis_length_impression"), {
        very_long: 18,
        somewhat_long: 42,
        just_right: 82,
        somewhat_short: 64,
        short: 54,
      }),
      mapValue(getStringAnswer(response, "diagnosis_fatigue_point"), {
        profile_setup: 45,
        early_questions: 38,
        middle_questions: 32,
        late_questions: 28,
        profile_finish: 48,
        none: 88,
      }),
      toFiveScaleScore(getNumberAnswer(response, "diagnosis_satisfaction")),
      toFiveScaleScore(getNumberAnswer(response, "diagnosis_fun_over_hassle")),
      toFiveScaleScore(getNumberAnswer(response, "diagnosis_intent_confusion"), true),
    ].filter((value): value is number => value !== null),
  );

  const dropDelight = average(
    [
      mapValue(getStringAnswer(response, "drop_first_impression"), {
        wow_interesting: 95,
        slightly_excited: 82,
        neutral: 45,
        not_compelling: 18,
        unclear: 28,
      }),
      toFiveScaleScore(getNumberAnswer(response, "compatibility_score_trust")),
      toFiveScaleScore(getNumberAnswer(response, "reasons_trust")),
      toFiveScaleScore(getNumberAnswer(response, "want_to_talk")),
    ].filter((value): value is number => value !== null),
  );

  const chatFriction = average(
    [
      toFiveScaleScore(getNumberAnswer(response, "first_message_ease"), true),
      mapValue(getStringAnswer(response, "first_message_hesitation"), {
        a_lot: 92,
        a_bit: 70,
        not_much: 35,
        none: 12,
      }),
      toFiveScaleScore(getNumberAnswer(response, "first_message_confusion")),
    ].filter((value): value is number => value !== null),
  );

  const safety = average(
    [
      toFiveScaleScore(getNumberAnswer(response, "tsukuba_only_safety")),
      toFiveScaleScore(getNumberAnswer(response, "optional_photo_safety")),
      toFiveScaleScore(getNumberAnswer(response, "nickname_safety")),
      toFiveScaleScore(getNumberAnswer(response, "blocklist_expectation")),
      countPenalty(getArrayAnswer(response, "anxieties"), [
        "could_match_acquaintance",
        "too_anonymous",
        "worry_about_bad_actors",
        "data_handling",
        "screenshot_risk",
      ]),
    ].filter((value): value is number => value !== null),
  );

  const nps = getNumberAnswer(response, "nps");
  const referral = average(
    [
      nps !== null ? nps * 10 : null,
      getStringAnswer(response, "nps_reason") ? 70 : 25,
      getStringAnswer(response, "describe_to_friend") ? 76 : 20,
      getStringAnswer(response, "best_part") ? 70 : 25,
      getStringAnswer(response, "weakest_part") ? 58 : 25,
    ].filter((value): value is number => value !== null),
  );

  return {
    cautionReduction,
    diagnosisLoad,
    dropDelight,
    chatFriction,
    safety,
    referral,
    negativeIntensity: calculateNegativeIntensity(response),
  };
}

export function attachScores(responses: StoredResponse[]): ResponseWithScores[] {
  return responses.map((response) => ({
    ...response,
    scores: computeResponseScores(response),
  }));
}

export function filterResponses<T extends ResponseWithScores>(
  responses: T[],
  filters: ResponseFilters = {},
): T[] {
  return responses.filter((response) => {
    if (filters.status && filters.status !== "all" && response.status !== filters.status) {
      return false;
    }

    if (filters.gender && getStringAnswer(response, "gender") !== filters.gender) return false;
    if (filters.grade && getStringAnswer(response, "grade") !== filters.grade) return false;
    if (
      filters.matchingAppExperience &&
      getStringAnswer(response, "matching_app_experience") !== filters.matchingAppExperience
    ) {
      return false;
    }
    if (
      filters.impressionBeforeSignup &&
      getStringAnswer(response, "impression_before_signup") !== filters.impressionBeforeSignup
    ) {
      return false;
    }
    if (
      filters.dropFirstImpression &&
      getStringAnswer(response, "drop_first_impression") !== filters.dropFirstImpression
    ) {
      return false;
    }

    const nps = getNumberAnswer(response, "nps");
    if (filters.npsBand === "high" && (nps === null || nps < 9)) return false;
    if (filters.npsBand === "mid" && (nps === null || nps < 7 || nps > 8)) return false;
    if (filters.npsBand === "low" && (nps === null || nps > 6)) return false;

    const noFacePhoto = getNumberAnswer(response, "no_face_photo_interest");
    if (filters.noFacePhotoInterestBand === "high" && (noFacePhoto === null || noFacePhoto < 4)) {
      return false;
    }
    if (filters.noFacePhotoInterestBand === "low" && (noFacePhoto === null || noFacePhoto >= 4)) {
      return false;
    }

    const firstMessageEase = getNumberAnswer(response, "first_message_ease");
    if (filters.firstMessageEaseBand === "high" && (firstMessageEase === null || firstMessageEase < 4)) {
      return false;
    }
    if (filters.firstMessageEaseBand === "low" && (firstMessageEase === null || firstMessageEase >= 4)) {
      return false;
    }

    return true;
  });
}

function distributionFromValues(values: string[], questionId: string) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  return Array.from(counts.entries()).map(([value, count]) => ({
    label:
      surveyQuestionMap[questionId]?.options?.find((option) => option.value === value)?.label ?? value,
    count,
  }));
}

export function buildDashboardData(responses: ResponseWithScores[]): DashboardData {
  const submitted = responses.filter((response) => response.status === "submitted");
  const freeTextEntries = buildFreeTextEntries(submitted);
  const promoterReasons = submitted
    .filter((response) => (getNumberAnswer(response, "nps") ?? -1) >= 9)
    .flatMap((response) => extractKeywords(getStringAnswer(response, "nps_reason") ?? ""));
  const detractorReasons = submitted
    .filter((response) => {
      const nps = getNumberAnswer(response, "nps");
      return nps !== null && nps <= 6;
    })
    .flatMap((response) => extractKeywords(getStringAnswer(response, "nps_reason") ?? ""));

  const averageMinutes = average(
    submitted
      .map((response) => {
        if (!response.submittedAt) return null;
        return (
          (new Date(response.submittedAt).getTime() - new Date(response.startedAt).getTime()) /
          1000 /
          60
        );
      })
      .filter((value): value is number => value !== null && Number.isFinite(value)),
  );

  return {
    totals: {
      totalResponses: responses.length,
      submittedResponses: submitted.length,
      completionRate: responses.length === 0 ? 0 : (submitted.length / responses.length) * 100,
      averageMinutes,
      averageNps: average(
        submitted
          .map((response) => getNumberAnswer(response, "nps"))
          .filter((value): value is number => value !== null),
      ),
      averageSignupEase: average(
        submitted
          .map((response) => getNumberAnswer(response, "signup_ease"))
          .filter((value): value is number => value !== null),
      ),
      averageDiagnosisSatisfaction: average(
        submitted
          .map((response) => getNumberAnswer(response, "diagnosis_satisfaction"))
          .filter((value): value is number => value !== null),
      ),
      averageChatEase: average(
        submitted
          .map((response) => getNumberAnswer(response, "first_message_ease"))
          .filter((value): value is number => value !== null),
      ),
      averageSafety: average(
        submitted
          .map((response) => response.scores.safety)
          .filter((value): value is number => value !== null),
      ),
      matchingAppRatio:
        submitted.length === 0
          ? 0
          : (submitted.filter((response) => getStringAnswer(response, "closest_category") === "matching_app")
              .length /
              submitted.length) *
            100,
    },
    sectionFunnel: surveySections.map((section, index) => {
      const reached = responses.filter((response) => getProgressInfo(response).highestReachedIndex >= index).length;
      const completed = responses.filter(
        (response) => getProgressInfo(response).highestCompletedIndex >= index,
      ).length;

      return {
        key: section.key,
        title: section.title,
        reached,
        completed,
        abandonRate: reached === 0 ? 0 : ((reached - completed) / reached) * 100,
      };
    }),
    distributions: {
      dropFirstImpression: distributionFromValues(
        submitted
          .map((response) => getStringAnswer(response, "drop_first_impression"))
          .filter((value): value is string => Boolean(value)),
        "drop_first_impression",
      ),
      nps: Array.from({ length: 11 }, (_, index) => ({
        label: String(index),
        count: submitted.filter((response) => getNumberAnswer(response, "nps") === index).length,
      })),
      submissionTimeline: Object.entries(
        submitted.reduce<Record<string, number>>((acc, response) => {
          if (!response.submittedAt) return acc;
          const date = response.submittedAt.slice(0, 10);
          acc[date] = (acc[date] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([date, count]) => ({ date, count })),
      likert: [
        "signup_ease",
        "diagnosis_satisfaction",
        "compatibility_score_trust",
        "reasons_trust",
        "first_message_ease",
        "tsukuba_only_safety",
      ].map((questionId) => ({
        questionId,
        label: surveyQuestionMap[questionId]?.label ?? questionId,
        average: average(
          submitted
            .map((response) => getNumberAnswer(response, questionId))
            .filter((value): value is number => value !== null),
        ),
      })),
    },
    reasonHighlights: {
      promoters: Array.from(new Set(promoterReasons)).slice(0, 8),
      detractors: Array.from(new Set(detractorReasons)).slice(0, 8),
    },
    topicFrequency: buildTopicFrequency(freeTextEntries),
  };
}

export function buildResponseSummary(response: ResponseWithScores) {
  return {
    nps: getNumberAnswer(response, "nps"),
    diagnosisSatisfaction: getNumberAnswer(response, "diagnosis_satisfaction"),
    dropFirstImpression: getStringAnswer(response, "drop_first_impression"),
    chatEase: getNumberAnswer(response, "first_message_ease"),
    comfortScore: response.scores.safety,
    hasComment: surveySections.some((section) =>
      section.questions.some((question) => {
        if (question.type !== "textarea" && question.type !== "shortText") return false;
        return Boolean(getStringAnswer(response, question.id));
      }),
    ),
    negativeIntensity: response.scores.negativeIntensity,
  };
}

export function buildFreeTextQuestionBreakdown(responses: ResponseWithScores[]) {
  const entries = buildFreeTextEntries(responses);

  return surveySections.flatMap((section) =>
    section.questions
      .filter((question) => question.type === "textarea" || question.type === "shortText")
      .map((question) => {
        const questionEntries = entries.filter((entry) => entry.questionId === question.id);
        return {
          questionId: question.id,
          label: question.label,
          count: questionEntries.length,
          sentiments: {
            positive: questionEntries.filter((entry) => entry.sentiment === "ポジ").length,
            negative: questionEntries.filter((entry) => entry.sentiment === "ネガ").length,
            needsAttention: questionEntries.filter((entry) => entry.sentiment === "要改善").length,
          },
        };
      }),
  );
}

export function getQuickSentiment(response: ResponseWithScores) {
  const strongestText = [
    getStringAnswer(response, "drop_weak_points"),
    getStringAnswer(response, "why_not_spread"),
    getStringAnswer(response, "uncool_or_unclear_points"),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return strongestText ? classifySentiment(strongestText) : "要改善";
}
