"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <Card className="w-full max-w-xl">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-medium">問題が発生しました</p>
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-3xl tracking-tight text-foreground">
                  しばらくしてから再試行してください
                </h1>
                <p className="text-sm leading-7 text-muted-foreground">
                  {error.message || "予期しないエラーが発生しました。"}
                </p>
              </div>
              <Button onClick={reset}>再読み込みする</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
