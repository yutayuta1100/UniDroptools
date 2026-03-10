import Link from "next/link";
import { Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8 sm:p-10">
          <Badge variant="outline">404</Badge>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Compass className="h-5 w-5" />
              <span className="text-sm">指定されたページは見つかりませんでした。</span>
            </div>
            <h1 className="font-serif text-4xl tracking-tight text-foreground">
              移動先の URL を確認してください
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              公開アンケートは `/survey`、管理画面は `/admin` 配下です。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/survey">アンケートへ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">トップへ戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
