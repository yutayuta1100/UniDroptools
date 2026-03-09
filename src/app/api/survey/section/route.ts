import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import type { SurveyAnswers } from "@/lib/survey-types";
import { ResponseValidationError, saveSectionAnswers } from "@/lib/survey-store";
import { sectionSaveSchema } from "@/lib/validation";

function getRequestKey(request: Request) {
  return request.headers.get("x-forwarded-for") ?? "local";
}

export async function POST(request: Request) {
  const limit = checkRateLimit(`survey-section:${getRequestKey(request)}`, 40, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "短時間に保存しすぎています。少し待ってから再試行してください。",
      },
      { status: 429 },
    );
  }

  try {
    const parsed = sectionSaveSchema.parse(await request.json());
    const response = await saveSectionAnswers({
      ...parsed,
      answers: parsed.answers as SurveyAnswers,
    });

    return NextResponse.json({
      ok: true,
      response: {
        status: response.status,
        answers: response.answers,
        metadata: response.metadata,
      },
    });
  } catch (error) {
    if (error instanceof ResponseValidationError) {
      return NextResponse.json(
        {
          error: "未入力または入力形式に問題があります。",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "保存に失敗しました。",
      },
      { status: 500 },
    );
  }
}
