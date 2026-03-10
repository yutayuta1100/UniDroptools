import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { addAnalysisTag, removeAnalysisTag } from "@/lib/survey-store";

const addTagSchema = z.object({
  responseId: z.string().uuid(),
  questionId: z.string().min(1),
  tagType: z.enum(["sentiment", "topic", "priority", "custom"]),
  tagValue: z.string().min(1).max(100),
});

const removeTagSchema = z.object({
  tagId: z.string().uuid(),
});

async function ensureAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = addTagSchema.parse(await request.json());
    await addAnalysisTag(parsed);
    revalidatePath("/admin/analysis");
    revalidatePath(`/admin/responses/${parsed.responseId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "タグ追加に失敗しました。",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await ensureAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = removeTagSchema.parse(await request.json());
    await removeAnalysisTag(parsed.tagId);
    revalidatePath("/admin/analysis");
    revalidatePath("/admin/responses");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "タグ削除に失敗しました。",
      },
      { status: 400 },
    );
  }
}
