import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-5 py-3 text-sm text-muted-foreground shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        ページを読み込んでいます...
      </div>
    </main>
  );
}
