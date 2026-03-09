import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "回答完了",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SurveyCompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8 sm:p-10">
          <Badge variant="success">回答完了</Badge>
          <div className="space-y-3">
            <h1 className="font-serif text-4xl tracking-tight text-foreground">ありがとうございました</h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              回答は保存されました。厳しめのフィードバックも含めて、次の改善にそのまま使います。
            </p>
          </div>
          <div className="rounded-3xl bg-secondary px-5 py-4 text-sm leading-7 text-secondary-foreground">
            個人が特定される形では扱わず、体験改善のための集計と分析に利用します。
          </div>
          <Button asChild variant="outline">
            <Link href="/survey">回答画面に戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
