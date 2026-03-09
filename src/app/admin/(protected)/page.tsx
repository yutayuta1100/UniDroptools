import Link from "next/link";

import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { MetricCard } from "@/components/admin/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { surveyQuestionMap } from "@/config/survey";
import {
  attachScores,
  buildDashboardData,
  filterResponses,
  type ResponseFilters,
} from "@/lib/analytics";
import { hasDatabaseUrl } from "@/lib/db";
import { listStoredResponses } from "@/lib/survey-store";
import { formatDuration } from "@/lib/utils";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasDatabaseUrl()) {
    return <AdminSetupNotice message="DATABASE_URL を設定し、マイグレーションと seed を実行してください。" />;
  }

  const params = await searchParams;
  const filters: ResponseFilters = {
    status: (paramValue(params.status) as ResponseFilters["status"]) ?? "all",
    gender: paramValue(params.gender),
    grade: paramValue(params.grade),
    matchingAppExperience: paramValue(params.matchingAppExperience),
    impressionBeforeSignup: paramValue(params.impressionBeforeSignup),
    dropFirstImpression: paramValue(params.dropFirstImpression),
    npsBand: paramValue(params.npsBand) as ResponseFilters["npsBand"],
    noFacePhotoInterestBand: paramValue(params.noFacePhotoInterestBand) as ResponseFilters["noFacePhotoInterestBand"],
    firstMessageEaseBand: paramValue(params.firstMessageEaseBand) as ResponseFilters["firstMessageEaseBand"],
  };

  const responses = attachScores(await listStoredResponses());
  const filteredResponses = filterResponses(responses, filters);
  const dashboard = buildDashboardData(filteredResponses);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="outline">Dashboard</Badge>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">テスター回答ダッシュボード</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            仮説検証に必要な指標を自動集計しています。フィルタを切り替えると、属性別の傾向も確認できます。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/api/admin/export/raw">ローデータ CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/api/admin/export/analysis">分析用 CSV</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>クロス分析フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Select name="status" defaultValue={filters.status ?? "all"}>
              <option value="all">全ステータス</option>
              <option value="submitted">完了のみ</option>
              <option value="in_progress">途中のみ</option>
            </Select>
            <Select name="gender" defaultValue={filters.gender ?? ""}>
              <option value="">性別: 全体</option>
              {surveyQuestionMap.gender.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="grade" defaultValue={filters.grade ?? ""}>
              <option value="">学年: 全体</option>
              {surveyQuestionMap.grade.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              name="matchingAppExperience"
              defaultValue={filters.matchingAppExperience ?? ""}
            >
              <option value="">利用経験: 全体</option>
              {surveyQuestionMap.matching_app_experience.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              name="impressionBeforeSignup"
              defaultValue={filters.impressionBeforeSignup ?? ""}
            >
              <option value="">登録前印象: 全体</option>
              {surveyQuestionMap.impression_before_signup.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="dropFirstImpression" defaultValue={filters.dropFirstImpression ?? ""}>
              <option value="">Drop 第一印象: 全体</option>
              {surveyQuestionMap.drop_first_impression.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="npsBand" defaultValue={filters.npsBand ?? ""}>
              <option value="">NPS: 全体</option>
              <option value="high">高い (9-10)</option>
              <option value="mid">中間 (7-8)</option>
              <option value="low">低い (0-6)</option>
            </Select>
            <Select
              name="noFacePhotoInterestBand"
              defaultValue={filters.noFacePhotoInterestBand ?? ""}
            >
              <option value="">顔写真なし評価: 全体</option>
              <option value="high">高い (4-5)</option>
              <option value="low">低い (1-3)</option>
            </Select>
            <Select
              name="firstMessageEaseBand"
              defaultValue={filters.firstMessageEaseBand ?? ""}
            >
              <option value="">チャット送りやすさ: 全体</option>
              <option value="high">高い (4-5)</option>
              <option value="low">低い (1-3)</option>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary">
                反映
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/admin">リセット</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="総回答数"
          value={`${dashboard.totals.totalResponses}`}
          helper={`完了 ${dashboard.totals.submittedResponses} 件`}
        />
        <MetricCard
          label="回答完了率"
          value={`${dashboard.totals.completionRate.toFixed(1)}%`}
          helper="submitted / total"
        />
        <MetricCard
          label="平均回答時間"
          value={formatDuration(dashboard.totals.averageMinutes)}
          helper="開始から送信まで"
        />
        <MetricCard
          label="平均 NPS"
          value={dashboard.totals.averageNps?.toFixed(1) ?? "-"}
          helper="0〜10"
        />
        <MetricCard
          label="マッチングアプリ認識比率"
          value={`${dashboard.totals.matchingAppRatio.toFixed(1)}%`}
          helper="closest_category ベース"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="登録しやすさ平均"
          value={dashboard.totals.averageSignupEase?.toFixed(2) ?? "-"}
        />
        <MetricCard
          label="診断満足度平均"
          value={dashboard.totals.averageDiagnosisSatisfaction?.toFixed(2) ?? "-"}
        />
        <MetricCard
          label="チャット初手の送りやすさ平均"
          value={dashboard.totals.averageChatEase?.toFixed(2) ?? "-"}
        />
        <MetricCard
          label="安心感スコア平均"
          value={dashboard.totals.averageSafety?.toFixed(1) ?? "-"}
        />
      </section>

      <DashboardCharts data={dashboard} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>友達に勧めたい上位理由</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {dashboard.reasonHighlights.promoters.length === 0 ? (
              <Badge variant="outline">まだデータがありません</Badge>
            ) : (
              dashboard.reasonHighlights.promoters.map((reason) => (
                <Badge key={reason} variant="muted">
                  {reason}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>友達に勧めにくい下位理由</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {dashboard.reasonHighlights.detractors.length === 0 ? (
              <Badge variant="outline">まだデータがありません</Badge>
            ) : (
              dashboard.reasonHighlights.detractors.map((reason) => (
                <Badge key={reason} variant="warning">
                  {reason}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>頻出トピック</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {dashboard.topicFrequency.map((topic) => (
            <Badge key={topic.keyword} variant="outline">
              {topic.keyword} ({topic.count})
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
