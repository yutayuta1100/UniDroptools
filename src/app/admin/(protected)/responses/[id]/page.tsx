import { notFound } from "next/navigation";

import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { KeywordHighlighter } from "@/components/admin/KeywordHighlighter";
import { MetricCard } from "@/components/admin/MetricCard";
import { ResponseNotesEditor } from "@/components/admin/ResponseNotesEditor";
import { TagEditor } from "@/components/admin/TagEditor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { surveySections } from "@/config/survey";
import { attachScores, getQuickSentiment } from "@/lib/analytics";
import { formatAnswerValue } from "@/lib/answer-helpers";
import { classifySentiment, extractKeywords, suggestTags } from "@/lib/free-text";
import { hasDatabaseUrl } from "@/lib/db";
import { getStoredResponseById } from "@/lib/survey-store";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!hasDatabaseUrl()) {
    return <AdminSetupNotice message="DATABASE_URL が未設定のため、回答詳細を表示できません。" />;
  }

  const { id } = await params;
  const response = await getStoredResponseById(id);

  if (!response) {
    notFound();
  }

  const [scoredResponse] = attachScores([response]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">Response Detail</Badge>
          <Badge variant={scoredResponse.status === "submitted" ? "success" : "outline"}>
            {scoredResponse.status === "submitted" ? "完了" : "途中保存"}
          </Badge>
          <Badge variant="muted">{scoredResponse.respondentCode}</Badge>
        </div>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">回答詳細</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          開始: {formatDateTime(scoredResponse.startedAt)} / 送信: {formatDateTime(scoredResponse.submittedAt)}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="警戒心低減スコア" value={scoredResponse.scores.cautionReduction?.toFixed(1) ?? "-"} />
        <MetricCard label="診断負荷スコア" value={scoredResponse.scores.diagnosisLoad?.toFixed(1) ?? "-"} />
        <MetricCard label="Drop 感動スコア" value={scoredResponse.scores.dropDelight?.toFixed(1) ?? "-"} />
        <MetricCard label="チャット始動難易度" value={scoredResponse.scores.chatFriction?.toFixed(1) ?? "-"} />
        <MetricCard label="安心感スコア" value={scoredResponse.scores.safety?.toFixed(1) ?? "-"} />
        <MetricCard label="紹介可能性スコア" value={scoredResponse.scores.referral?.toFixed(1) ?? "-"} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>簡易サマリー</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">全体感情: {getQuickSentiment(scoredResponse)}</Badge>
          <Badge variant="warning">ネガ強度: {scoredResponse.scores.negativeIntensity}</Badge>
          <Badge variant="muted">最終更新: {formatDateTime(scoredResponse.updatedAt)}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>管理メモ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseNotesEditor
            responseId={scoredResponse.id}
            defaultValues={{
              memo: scoredResponse.notes?.memo ?? "",
              internalComment: scoredResponse.notes?.internalComment ?? "",
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {surveySections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.questions.map((question) => {
                const rawValue = scoredResponse.answers[question.id] ?? null;
                const textValue = typeof rawValue === "string" ? rawValue : null;
                const existingTags = scoredResponse.tags.filter((tag) => tag.questionId === question.id);
                const keywords = textValue ? extractKeywords(textValue) : [];
                const suggested = textValue ? suggestTags(textValue) : [];

                return (
                  <div key={question.id} className="space-y-3 border-b border-border/70 pb-5 last:border-none last:pb-0">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{question.label}</p>
                      {textValue ? (
                        <KeywordHighlighter text={textValue} keywords={keywords} />
                      ) : (
                        <p className="text-sm leading-7 text-muted-foreground">
                          {formatAnswerValue(question.id, rawValue)}
                        </p>
                      )}
                    </div>

                    {textValue ? (
                      <div className="space-y-3 rounded-2xl bg-secondary/60 p-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">感情: {classifySentiment(textValue)}</Badge>
                          {keywords.map((keyword) => (
                            <Badge key={keyword} variant="muted">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <TagEditor
                          responseId={scoredResponse.id}
                          questionId={question.id}
                          existingTags={existingTags}
                          suggestedTags={suggested}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
