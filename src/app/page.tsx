import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "UniDrop テスターアンケート",
  description:
    "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めて改善に活かします。",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UniDrop テスターアンケート",
  url: absoluteUrl("/"),
  inLanguage: "ja",
  description:
    "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めて改善に活かします。",
};

export default function HomePage() {
  return (
    <main className="space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="rounded-[2rem] border border-border/70 bg-card/80 px-6 py-10 shadow-soft sm:px-10 sm:py-14">
        <div className="max-w-4xl space-y-6">
          <Badge variant="outline">UniDrop Closed Test</Badge>
          <div className="space-y-4">
            <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-6xl">
              テスターの率直な声を、
              <br />
              次の改善につなげるためのアンケート
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              UniDrop の登録、価値観診断、Drop、チャット体験について、良かった点だけでなく違和感や不安もそのまま集めるためのフォームです。遠慮のない回答がいちばん役に立ちます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/survey">アンケートを開始</Link>
            </Button>
            <p className="text-sm leading-7 text-muted-foreground">
              回答時間の目安は 7〜10 分です。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>このアンケートの意義</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            UniDrop を褒めるためではなく、どこで警戒されたか、どこでだれたか、何が伝わりづらかったかを明確にするためのアンケートです。自由記述と選択式の両方で、改善に直結する材料を集めます。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>情報の扱い</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            回答は改善のための集計と確認に利用します。個人が特定される内容や、他のテスターに関する情報は書かない前提です。管理画面は一般公開せず、運営側だけが確認します。
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
