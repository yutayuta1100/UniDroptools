"use client";

import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StickyNavigation({
  canGoBack,
  canGoNext,
  isLastSection,
  isSaving,
  saveLabel,
  onBack,
  onSaveDraft,
  onNext,
}: {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastSection: boolean;
  isSaving: boolean;
  saveLabel?: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-sm text-muted-foreground">
          {saveLabel ?? "セクション単位で保存されます。あとで再開できます。"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={!canGoBack || isSaving}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <Button variant="secondary" onClick={onSaveDraft} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            下書き保存
          </Button>
          <Button onClick={onNext} disabled={!canGoNext || isSaving}>
            {isLastSection ? <Send className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {isLastSection ? "確認へ進む" : "次へ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
