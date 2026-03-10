import type { Metadata } from "next";

import { SurveyExperience } from "@/components/survey/SurveyExperience";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "アンケート回答",
  description:
    "UniDrop クローズドテスト向けアンケートフォーム。価値観診断、Drop、チャット体験の率直なフィードバックを送れます。",
  alternates: {
    canonical: absoluteUrl("/survey"),
  },
};

export const dynamic = "force-dynamic";

export default function SurveyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-0 py-8 sm:py-10">
      <section className="space-y-4 px-4 sm:px-6">
        <Badge variant="outline">UniDrop Closed Test</Badge>
        <div className="space-y-4">
          <h1 className="max-w-3xl font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            改善のための率直なフィードバックを集めています
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            このフォームは、UniDrop の体験を静かに精度改善していくためのものです。褒める必要はありません。違和感や不安があったところほど、そのまま残してください。
          </p>
        </div>
      </section>

      <SurveyExperience />
    </main>
  );
}
