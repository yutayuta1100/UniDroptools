import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import type { SurveyAnswers } from "@/lib/survey-types";
import { ResponseValidationError, submitSurveyResponse } from "@/lib/survey-store";
import { submitSurveySchema } from "@/lib/validation";

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
