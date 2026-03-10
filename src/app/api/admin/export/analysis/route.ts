import { NextResponse } from "next/server";

import { attachScores } from "@/lib/analytics";
import { getAdminSession } from "@/lib/auth";
import { buildAnalysisCsv } from "@/lib/export";
import { listStoredResponses } from "@/lib/survey-store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = buildAnalysisCsv(attachScores(await listStoredResponses()));
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="unidrop-analysis-responses.csv"',
    },
  });
}
