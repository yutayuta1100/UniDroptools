import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { saveAdminNotes } from "@/lib/survey-store";

const notesSchema = z.object({
  responseId: z.string().uuid(),
  memo: z.string().max(2000).default(""),
  internalComment: z.string().max(2000).default(""),
});

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = notesSchema.parse(await request.json());
    await saveAdminNotes({
      ...parsed,
      updatedBy: session.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/responses");
    revalidatePath(`/admin/responses/${parsed.responseId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "管理メモの保存に失敗しました。",
      },
      { status: 400 },
    );
  }
}
