import Link from "next/link";

import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { ResponsesTable } from "@/components/admin/ResponsesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { surveyQuestionMap } from "@/config/survey";
import {
  attachScores,
  buildResponseSummary,
  filterResponses,
  type ResponseFilters,
} from "@/lib/analytics";
import { hasDatabaseUrl } from "@/lib/db";
import { listStoredResponses } from "@/lib/survey-store";

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function AdminResponsesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasDatabaseUrl()) {
    return <AdminSetupNotice message="DATABASE_URL を設定し、回答データを読み込める状態にしてください。" />;
  }

  const params = await searchParams;
  const filters: ResponseFilters = {
    status: (paramValue(params.status) as ResponseFilters["status"]) ?? "all",
    grade: paramValue(params.grade),
    gender: paramValue(params.gender),
    matchingAppExperience: paramValue(params.matchingAppExperience),
    npsBand: paramValue(params.npsBand) as ResponseFilters["npsBand"],
    dropFirstImpression: paramValue(params.dropFirstImpression),
  };
  const sortBy = paramValue(params.sortBy) ?? "submittedAt";

  const responses = attachScores(await listStoredResponses())
    .map((response) => ({
      ...response,
      summary: buildResponseSummary(response),
    }));
  const filtered = filterResponses(responses, filters);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "nps":
        return (b.summary.nps ?? -1) - (a.summary.nps ?? -1);
      case "diagnosis":
        return (b.summary.diagnosisSatisfaction ?? -1) - (a.summary.diagnosisSatisfaction ?? -1);
      case "negative":
        return b.summary.negativeIntensity - a.summary.negativeIntensity;
      case "chat":
        return (b.summary.chatEase ?? -1) - (a.summary.chatEase ?? -1);
      default:
        return new Date(b.submittedAt ?? b.updatedAt).getTime() - new Date(a.submittedAt ?? a.updatedAt).getTime();
    }
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Responses</Badge>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">回答一覧</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          主要指標を一覧で見ながら、気になる回答は詳細に掘れます。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>フィルタと並び替え</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Select name="status" defaultValue={filters.status ?? "all"}>
              <option value="all">全ステータス</option>
              <option value="submitted">完了のみ</option>
              <option value="in_progress">途中のみ</option>
            </Select>
            <Select name="grade" defaultValue={filters.grade ?? ""}>
              <option value="">学年: 全体</option>
              {surveyQuestionMap.grade.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="gender" defaultValue={filters.gender ?? ""}>
              <option value="">性別: 全体</option>
              {surveyQuestionMap.gender.options?.map((option) => (
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
            <Select name="npsBand" defaultValue={filters.npsBand ?? ""}>
              <option value="">NPS: 全体</option>
              <option value="high">高い (9-10)</option>
              <option value="mid">中間 (7-8)</option>
              <option value="low">低い (0-6)</option>
            </Select>
            <Select name="dropFirstImpression" defaultValue={filters.dropFirstImpression ?? ""}>
              <option value="">Drop 第一印象: 全体</option>
              {surveyQuestionMap.drop_first_impression.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="sortBy" defaultValue={sortBy}>
              <option value="submittedAt">新しい順</option>
              <option value="nps">NPS 高い順</option>
              <option value="diagnosis">診断満足度 高い順</option>
              <option value="chat">チャット送りやすさ 高い順</option>
              <option value="negative">ネガ強度 高い順</option>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary">
                反映
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/admin/responses">リセット</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ResponsesTable responses={sorted} />
    </div>
  );
}
