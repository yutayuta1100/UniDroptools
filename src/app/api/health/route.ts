import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "unidrop-tester-survey",
    timestamp: new Date().toISOString(),
  });
}
