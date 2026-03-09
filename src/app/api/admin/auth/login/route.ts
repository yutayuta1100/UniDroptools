import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAdmin, createAdminSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function getRequestKey(request: Request) {
  return request.headers.get("x-forwarded-for") ?? "local";
}

export async function POST(request: Request) {
  const limit = checkRateLimit(`admin-login:${getRequestKey(request)}`, 8, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "ログイン試行回数が多すぎます。少し待ってから再試行してください。",
      },
      { status: 429 },
    );
  }

  try {
    const parsed = loginSchema.parse(await request.json());
    const session = await authenticateAdmin(parsed.email, parsed.password);

    if (!session) {
      return NextResponse.json(
        {
          error: "メールアドレスまたはパスワードが正しくありません。",
        },
        { status: 401 },
      );
    }

    await createAdminSession(session);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "ログインに失敗しました。",
      },
      { status: 500 },
    );
  }
}
