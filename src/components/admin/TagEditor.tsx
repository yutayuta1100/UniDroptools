"use client";

import { useState } from "react";

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
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function addTag(tagValue: string, tagType = "topic") {
    if (!tagValue) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/tags", {
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
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  async function removeTag(tagId: string) {
    setIsLoading(true);
    try {
      await fetch("/api/admin/tags", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagId }),
      });
      window.location.reload();
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
          onClick={() => {
            void addTag(customTag, "custom");
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
