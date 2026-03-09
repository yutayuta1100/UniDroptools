import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createRespondentCode, RESPONDENT_COOKIE } from "@/lib/respondent";
import { getSurveySession } from "@/lib/survey-store";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let respondentCode = cookieStore.get(RESPONDENT_COOKIE)?.value;
    const shouldSetCookie = !respondentCode;

    if (!respondentCode) {
      respondentCode = createRespondentCode();
    }

    const response = await getSurveySession(respondentCode);
    const nextResponse = NextResponse.json({
      respondentCode,
      response: {
        status: response.status,
        answers: response.answers,
        metadata: response.metadata,
      },
    });

    if (shouldSetCookie) {
      nextResponse.cookies.set(RESPONDENT_COOKIE, respondentCode, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "セッションの取得に失敗しました。",
      },
      { status: 503 },
    );
  }
}
