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
    <main className="space-y-16 px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="rounded-[2rem] border border-border/70 bg-card/80 px-6 py-10 shadow-soft sm:px-10 sm:py-14">
        <div className="max-w-4xl space-y-6">
          <Badge variant="outline">UniDrop Closed Test</Badge>
          <div className="space-y-4">
            <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-6xl">
              テスターの本音を、そのまま改善に変えるためのアンケート
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              UniDrop の価値観診断、Drop、チャット体験について、静かな違和感まで拾うための調査サイトです。褒めるためではなく、次の改善に直結する構造化データと自由記述を集めます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/survey">アンケートを開始</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#about">このサイトについて</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>集めたいもの</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            入口の警戒心、55問診断の負荷、Drop を見た瞬間の感情、相性理由への納得感、チャット初手の送りやすさを定量と自由記述の両方で取得します。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>匿名性への配慮</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            回答は respondent code 単位で保存され、個人を特定する内容は書かない前提で設計しています。管理画面は認証必須です。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>分析しやすい構造</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            セクション別離脱率、主要スコア、NPS、自由記述タグ、分析用 CSV を自動でまとめ、あとから質問や指標を増やしやすい構成にしています。
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Badge variant="muted">What You Can Verify</Badge>
          <h2 className="font-serif text-3xl tracking-tight text-foreground">このサイトで見えること</h2>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>価値観診断という入口で、一般的な恋愛サービスのような警戒心がどこまで下がるか。</p>
            <p>55問という長さが、体験価値として成立しているか。それとも中盤以降で熱が落ちるか。</p>
            <p>Drop の第一印象、相性スコア、3つの理由、初手チャットのしやすさが、一連の流れとして自然につながっているか。</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>公開ページ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>検索エンジン向けにトップページ、`robots.txt`、`sitemap.xml`、構造化データを用意しています。</p>
            <p>回答フォームは `/survey`、管理画面は `/admin` 配下です。</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
