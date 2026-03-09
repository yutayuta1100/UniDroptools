import Link from "next/link";

import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { KeywordHighlighter } from "@/components/admin/KeywordHighlighter";
import { TagEditor } from "@/components/admin/TagEditor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { surveyQuestions } from "@/config/survey";
import {
  attachScores,
  buildFreeTextQuestionBreakdown,
  type ResponseWithScores,
} from "@/lib/analytics";
import { buildFreeTextEntries, buildTopicFrequency } from "@/lib/free-text";
import { hasDatabaseUrl } from "@/lib/db";
import { listStoredResponses } from "@/lib/survey-store";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function AdminAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasDatabaseUrl()) {
    return <AdminSetupNotice message="DATABASE_URL を設定し、自由記述分析を有効化してください。" />;
  }

  const params = await searchParams;
  const questionId = paramValue(params.questionId) ?? "";
  const sentiment = paramValue(params.sentiment) ?? "";

  const responses = attachScores(await listStoredResponses()).filter(
    (response) => response.status === "submitted",
  );
  const entries = buildFreeTextEntries(responses)
    .filter((entry) => (questionId ? entry.questionId === questionId : true))
    .filter((entry) => (sentiment ? entry.sentiment === sentiment : true));
  const topicFrequency = buildTopicFrequency(entries);
  const breakdown = buildFreeTextQuestionBreakdown(responses);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Analysis</Badge>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">自由記述分析</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          質問ごとの抽出、キーワードハイライト、簡易感情分類、手動タグ付けを行えます。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>抽出フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3">
            <Select name="questionId" defaultValue={questionId}>
              <option value="">全自由記述</option>
              {surveyQuestions
                .filter((question) => question.type === "textarea" || question.type === "shortText")
                .map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.label}
                  </option>
                ))}
            </Select>
            <Select name="sentiment" defaultValue={sentiment}>
              <option value="">感情分類: 全体</option>
              <option value="ポジ">ポジ</option>
              <option value="要改善">要改善</option>
              <option value="ネガ">ネガ</option>
            </Select>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              反映
            </button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>質問ごとの自由記述件数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.questionId} className="rounded-2xl border border-border/70 px-4 py-4">
                <p className="font-medium text-foreground">{item.label}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">件数: {item.count}</Badge>
                  <Badge variant="success">ポジ: {item.sentiments.positive}</Badge>
                  <Badge variant="muted">要改善: {item.sentiments.needsAttention}</Badge>
                  <Badge variant="warning">ネガ: {item.sentiments.negative}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>頻出トピック</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topicFrequency.map((topic) => (
              <Badge key={topic.keyword} variant="outline">
                {topic.keyword} ({topic.count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="space-y-4">
        {entries.map((entry) => {
          const response = responses.find((item) => item.id === entry.responseId) as ResponseWithScores | undefined;
          const existingTags = response?.tags.filter((tag) => tag.questionId === entry.questionId) ?? [];

          return (
            <Card key={`${entry.responseId}-${entry.questionId}`}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{surveyQuestions.find((question) => question.id === entry.questionId)?.label}</Badge>
                  <Badge variant={entry.sentiment === "ネガ" ? "warning" : entry.sentiment === "ポジ" ? "success" : "muted"}>
                    {entry.sentiment}
                  </Badge>
                  <Badge variant="muted">{entry.respondentCode}</Badge>
                  <Link href={`/admin/responses/${entry.responseId}`} className="text-sm text-primary hover:underline">
                    詳細へ
                  </Link>
                </div>

                <KeywordHighlighter text={entry.text} keywords={entry.keywords} />

                <TagEditor
                  responseId={entry.responseId}
                  questionId={entry.questionId}
                  existingTags={existingTags}
                  suggestedTags={entry.suggestedTags}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
