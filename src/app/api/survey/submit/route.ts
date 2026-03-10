import { NextResponse } from "next/server";

import { surveyQuestions } from "@/config/survey";
import { hasDatabaseUrl } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { SurveyAnswers } from "@/lib/survey-types";
import { ResponseValidationError, submitSurveyResponse } from "@/lib/survey-store";
import {
  normalizeAnswerValue,
  submitSurveySchema,
  validateQuestionValue,
} from "@/lib/validation";

function getRequestKey(request: Request) {
  return request.headers.get("x-forwarded-for") ?? "local";
}

export async function POST(request: Request) {
  const limit = checkRateLimit(`survey-submit:${getRequestKey(request)}`, 8, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "短時間に送信しすぎています。少し待ってから再試行してください。",
      },
      { status: 429 },
    );
  }

  try {
    const parsed = submitSurveySchema.parse(await request.json());

    if (!hasDatabaseUrl()) {
      const errors = surveyQuestions.reduce<Record<string, string>>((acc, question) => {
        const normalized = normalizeAnswerValue(question, parsed.answers[question.id]);
        const error = validateQuestionValue(question, normalized, true);

        if (error) {
          acc[question.id] = error;
        }

        return acc;
      }, {});

      if (Object.keys(errors).length > 0) {
        return NextResponse.json(
          {
            error: "必須項目の未入力があります。",
            errors,
          },
          { status: 400 },
        );
      }

      const submittedAt = new Date().toISOString();

      console.log(
        JSON.stringify({
          type: "survey_submission_fallback",
          submittedAt,
          respondentCode: parsed.respondentCode,
          answers: parsed.answers,
        }),
      );

      return NextResponse.json({
        ok: true,
        response: {
          id: `fallback-${parsed.respondentCode}`,
          submittedAt,
        },
      });
    }

    const response = await submitSurveyResponse({
      ...parsed,
      answers: parsed.answers as SurveyAnswers,
    });

    return NextResponse.json({
      ok: true,
      response: {
        id: response.id,
        submittedAt: response.submittedAt,
      },
    });
  } catch (error) {
    if (error instanceof ResponseValidationError) {
      return NextResponse.json(
        {
          error: "必須項目の未入力があります。",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "送信に失敗しました。",
      },
      { status: 500 },
    );
  }
}
