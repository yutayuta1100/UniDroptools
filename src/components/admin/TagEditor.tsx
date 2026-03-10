"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ExistingTag = {
  id: string;
  tagType: string;
  tagValue: string;
};

export function TagEditor({
  responseId,
  questionId,
  existingTags,
  suggestedTags,
}: {
  responseId: string;
  questionId: string;
  existingTags: ExistingTag[];
  suggestedTags: string[];
}) {
  const router = useRouter();
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function addTag(tagValue: string, tagType = "topic") {
    if (!tagValue) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          questionId,
          tagType,
          tagValue,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "タグ追加に失敗しました。");
      }

      toast.success("タグを追加しました。");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "タグ操作に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  async function removeTag(tagId: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagId }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "タグ削除に失敗しました。");
      }

      toast.success("タグを削除しました。");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "タグ操作に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {existingTags.length === 0 ? (
          <Badge variant="outline">タグ未設定</Badge>
        ) : (
          existingTags.map((tag) => (
            <button key={tag.id} type="button" onClick={() => removeTag(tag.id)} disabled={isLoading}>
              <Badge variant="muted">{tag.tagType}:{tag.tagValue}</Badge>
            </button>
          ))
        )}
      </div>

      {suggestedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(tag)}
              disabled={isLoading}
            >
              + {tag}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={customTag}
          onChange={(event) => setCustomTag(event.target.value)}
          placeholder="カスタムタグを追加"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await addTag(customTag, "custom");
            setCustomTag("");
          }}
          disabled={isLoading || customTag.trim().length === 0}
        >
          追加
        </Button>
      </div>
    </div>
  );
}
