"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const notesSchema = z.object({
  memo: z.string().max(2000, "2000文字以内で入力してください。"),
  internalComment: z.string().max(2000, "2000文字以内で入力してください。"),
});

type NotesFormValues = z.infer<typeof notesSchema>;

export function ResponseNotesEditor({
  responseId,
  defaultValues,
}: {
  responseId: string;
  defaultValues: NotesFormValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          memo: values.memo,
          internalComment: values.internalComment,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "管理メモの保存に失敗しました。");
      }

      form.reset(values);
      toast.success("管理メモを保存しました。");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "管理メモの保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="memo">メモ</Label>
        <Textarea
          id="memo"
          rows={5}
          placeholder="分析中に気づいたことを短く残せます。"
          {...register("memo")}
        />
        {errors.memo ? (
          <p className="text-sm text-destructive">{errors.memo.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalComment">管理者向け内部コメント</Label>
        <Textarea
          id="internalComment"
          rows={6}
          placeholder="次回の改善会議で見返したい観点や、個別の深掘りメモを残せます。"
          {...register("internalComment")}
        />
        {errors.internalComment ? (
          <p className="text-sm text-destructive">{errors.internalComment.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isDirty ? "未保存の変更があります。" : "この回答専用の管理メモです。"}
        </p>
        <Button type="submit" disabled={isSaving || isPending}>
          {isSaving || isPending ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
