import "server-only";

import { surveyQuestionMap, surveyQuestions, surveySectionMap, surveySections } from "@/config/survey";
import { getSql, hasDatabaseUrl } from "@/lib/db";
import type {
  AnalysisTagType,
  QuestionValue,
  SurveyAnswers,
  SurveyQuestion,
} from "@/lib/survey-types";
import { isEmptyAnswer, normalizeAnswerValue, validateQuestionValue } from "@/lib/validation";

type DbResponseRow = {
  id: string;
  respondent_code: string;
  started_at: string;
  submitted_at: string | null;
  status: "in_progress" | "submitted";
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type DbAnswerRow = {
  id: string;
  response_id: string;
  question_id: string;
  question_type: string;
  answer_value_json: unknown;
  answer_text: string | null;
  created_at: string;
  updated_at: string;
};

type DbTagRow = {
  id: string;
  response_id: string;
  question_id: string;
  tag_type: AnalysisTagType;
  tag_value: string;
  created_at: string;
};

export type StoredAnalysisTag = {
  id: string;
  responseId: string;
  questionId: string;
  tagType: AnalysisTagType;
  tagValue: string;
  createdAt: string;
};

export type StoredResponse = {
  id: string;
  respondentCode: string;
  startedAt: string;
  submittedAt: string | null;
  status: "in_progress" | "submitted";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  answers: SurveyAnswers;
  tags: StoredAnalysisTag[];
};

export class ResponseValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super("Validation failed.");
  }
}

function ensureDatabase() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured.");
  }
}

function normalizeMetadata(metadata: Record<string, unknown> | null) {
  return metadata ?? {};
}

function extractAnswerText(value: QuestionValue) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.join(" / ");
  return null;
}

function mapResponse(row: DbResponseRow): StoredResponse {
  return {
    id: row.id,
    respondentCode: row.respondent_code,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    status: row.status,
    metadata: normalizeMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    answers: {},
    tags: [],
  };
}

async function loadResponsesByWhere(
  whereSql?: { clause: string; values: unknown[] },
  db = getSql(),
) {
  ensureDatabase();
  const client = db as any;

  const responses = whereSql
    ? await client.unsafe<DbResponseRow[]>(
        `select id, respondent_code, started_at, submitted_at, status, metadata, created_at, updated_at
         from survey_responses
         ${whereSql.clause}
         order by created_at desc`,
        whereSql.values as never[],
      )
    : await client<DbResponseRow[]>`
        select id, respondent_code, started_at, submitted_at, status, metadata, created_at, updated_at
        from survey_responses
        order by created_at desc
      `;

  if (responses.length === 0) {
    return [];
  }

  const responseIds = responses.map((response) => response.id);
  const answers = await client<DbAnswerRow[]>`
    select id, response_id, question_id, question_type, answer_value_json, answer_text, created_at, updated_at
    from survey_answers
    where response_id in ${client(responseIds)}
    order by created_at asc
  `;
  const tags = await client<DbTagRow[]>`
    select id, response_id, question_id, tag_type, tag_value, created_at
    from analysis_tags
    where response_id in ${client(responseIds)}
    order by created_at asc
  `;

  const responseMap = new Map<string, StoredResponse>(
    responses.map((response) => [response.id, mapResponse(response)]),
  );

  for (const answer of answers) {
    const response = responseMap.get(answer.response_id);
    if (!response) continue;
    response.answers[answer.question_id] = (answer.answer_value_json as QuestionValue) ?? null;
  }

  for (const tag of tags) {
    const response = responseMap.get(tag.response_id);
    if (!response) continue;
    response.tags.push({
      id: tag.id,
      responseId: tag.response_id,
      questionId: tag.question_id,
      tagType: tag.tag_type,
      tagValue: tag.tag_value,
      createdAt: tag.created_at,
    });
  }

  return Array.from(responseMap.values());
}

function buildMetadata(
  current: Record<string, unknown>,
  sectionKey: string,
  completeSection: boolean,
) {
  const completedSectionKeys = Array.isArray(current.completedSectionKeys)
    ? (current.completedSectionKeys as string[])
    : [];
  const sectionUpdatedAt =
    typeof current.sectionUpdatedAt === "object" && current.sectionUpdatedAt
      ? (current.sectionUpdatedAt as Record<string, string>)
      : {};

  const nextCompleted = completeSection
    ? Array.from(new Set([...completedSectionKeys, sectionKey]))
    : completedSectionKeys;

  return {
    ...current,
    surveyVersion: "2026-03",
    lastSavedSectionKey: sectionKey,
    completedSectionKeys: nextCompleted,
    sectionUpdatedAt: {
      ...sectionUpdatedAt,
      [sectionKey]: new Date().toISOString(),
    },
  };
}

function validateAnswersForQuestions(
  questions: SurveyQuestion[],
  answers: SurveyAnswers,
  enforceRequired: boolean,
) {
  const normalizedAnswers: SurveyAnswers = {};
  const errors: Record<string, string> = {};

  for (const question of questions) {
    const normalized = normalizeAnswerValue(question, answers[question.id]);
    const error = validateQuestionValue(question, normalized, enforceRequired);
    normalizedAnswers[question.id] = normalized;
    if (error) {
      errors[question.id] = error;
    }
  }

  return { normalizedAnswers, errors };
}

async function upsertAnswers(
  tx: any,
  responseId: string,
  normalizedAnswers: SurveyAnswers,
  questions: SurveyQuestion[],
) {
  for (const question of questions) {
    const value = normalizedAnswers[question.id];

    if (isEmptyAnswer(value)) {
      await tx`
        delete from survey_answers
        where response_id = ${responseId} and question_id = ${question.id}
      `;
      continue;
    }

    await tx`
      insert into survey_answers (
        response_id,
        question_id,
        question_type,
        answer_value_json,
        answer_text
      )
      values (
        ${responseId},
        ${question.id},
        ${question.type},
        ${tx.json(value)},
        ${extractAnswerText(value)}
      )
      on conflict (response_id, question_id)
      do update set
        question_type = excluded.question_type,
        answer_value_json = excluded.answer_value_json,
        answer_text = excluded.answer_text,
        updated_at = now()
    `;
  }
}

async function getOrCreateResponse(tx: any, respondentCode: string) {
  const client = tx as any;
  const [response] = await client<DbResponseRow[]>`
    insert into survey_responses (respondent_code, status, metadata)
    values (${respondentCode}, 'in_progress', ${client.json({ surveyVersion: "2026-03" })})
    on conflict (respondent_code)
    do update set updated_at = now()
    returning id, respondent_code, started_at, submitted_at, status, metadata, created_at, updated_at
  `;

  return response;
}

export async function getSurveySession(respondentCode: string) {
  const responses = await loadResponsesByWhere({
    clause: "where respondent_code = $1 limit 1",
    values: [respondentCode],
  });

  if (responses.length > 0) {
    return responses[0];
  }

  ensureDatabase();
  const sql = getSql();
  const created = await getOrCreateResponse(sql, respondentCode);
  const loaded = await loadResponsesByWhere(
    {
      clause: "where id = $1 limit 1",
      values: [created.id],
    },
    sql,
  );

  return loaded[0];
}

export async function saveSectionAnswers({
  respondentCode,
  sectionKey,
  answers,
  completeSection,
}: {
  respondentCode: string;
  sectionKey: string;
  answers: SurveyAnswers;
  completeSection: boolean;
}) {
  ensureDatabase();

  const section = surveySectionMap[sectionKey];
  if (!section) {
    throw new Error("Unknown survey section.");
  }

  const { normalizedAnswers, errors } = validateAnswersForQuestions(
    section.questions,
    answers,
    completeSection,
  );

  if (Object.keys(errors).length > 0) {
    throw new ResponseValidationError(errors);
  }

  const sql = getSql();

  const responseId = await sql.begin(async (tx) => {
    const db = tx as any;
    const response = await getOrCreateResponse(db, respondentCode);

    if (response.status === "submitted") {
      throw new Error("This response has already been submitted.");
    }

    await upsertAnswers(db, response.id, normalizedAnswers, section.questions);

    const nextMetadata = buildMetadata(normalizeMetadata(response.metadata), sectionKey, completeSection);

    await db`
      update survey_responses
      set metadata = ${db.json(nextMetadata)}, updated_at = now()
      where id = ${response.id}
    `;
    return response.id;
  });

  const loaded = await getStoredResponseById(responseId);
  if (!loaded) {
    throw new Error("Failed to load saved response.");
  }
  return loaded;
}

export async function submitSurveyResponse({
  respondentCode,
  answers,
}: {
  respondentCode: string;
  answers: SurveyAnswers;
}) {
  ensureDatabase();

  const { normalizedAnswers, errors } = validateAnswersForQuestions(surveyQuestions, answers, true);

  if (Object.keys(errors).length > 0) {
    throw new ResponseValidationError(errors);
  }

  const sql = getSql();

  const responseId = await sql.begin(async (tx) => {
    const db = tx as any;
    const response = await getOrCreateResponse(db, respondentCode);

    if (response.status === "submitted") {
      return response.id;
    }

    await upsertAnswers(db, response.id, normalizedAnswers, surveyQuestions);

    const existingMetadata = normalizeMetadata(response.metadata);
    const sectionUpdatedAt =
      typeof existingMetadata.sectionUpdatedAt === "object" && existingMetadata.sectionUpdatedAt
        ? (existingMetadata.sectionUpdatedAt as Record<string, string>)
        : {};

    const nextMetadata = {
      ...existingMetadata,
      surveyVersion: "2026-03",
      lastSavedSectionKey: "review",
      completedSectionKeys: surveySections.map((section) => section.key),
      sectionUpdatedAt: {
        ...sectionUpdatedAt,
        review: new Date().toISOString(),
      },
    };

    await db`
      update survey_responses
      set
        status = 'submitted',
        submitted_at = now(),
        metadata = ${db.json(nextMetadata)},
        updated_at = now()
      where id = ${response.id}
    `;
    return response.id;
  });

  const loaded = await getStoredResponseById(responseId);
  if (!loaded) {
    throw new Error("Failed to load submitted response.");
  }
  return loaded;
}

export async function listStoredResponses() {
  return loadResponsesByWhere();
}

export async function getStoredResponseById(responseId: string) {
  const responses = await loadResponsesByWhere({
    clause: "where id = $1 limit 1",
    values: [responseId],
  });

  return responses[0] ?? null;
}

export async function addAnalysisTag(input: {
  responseId: string;
  questionId: string;
  tagType: AnalysisTagType;
  tagValue: string;
}) {
  ensureDatabase();
  const sql = getSql();

  await sql`
    insert into analysis_tags (response_id, question_id, tag_type, tag_value)
    values (${input.responseId}, ${input.questionId}, ${input.tagType}, ${input.tagValue})
    on conflict (response_id, question_id, tag_type, tag_value)
    do nothing
  `;
}

export async function removeAnalysisTag(tagId: string) {
  ensureDatabase();
  const sql = getSql();
  await sql`
    delete from analysis_tags
    where id = ${tagId}
  `;
}

export function getQuestionLabel(questionId: string) {
  return surveyQuestionMap[questionId]?.label ?? questionId;
}
