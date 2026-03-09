import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { formatAnswerValue } from "@/lib/answer-helpers";
import type { ResponseWithScores } from "@/lib/analytics";

export function ResponsesTable({
  responses,
}: {
  responses: Array<
    ResponseWithScores & {
      summary: {
        nps: number | null;
        diagnosisSatisfaction: number | null;
        dropFirstImpression: string | null;
        chatEase: number | null;
        comfortScore: number | null;
        hasComment: boolean;
        negativeIntensity: number;
      };
    }
  >;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>回答一覧</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-medium">回答</th>
              <th className="px-3 py-3 font-medium">状態</th>
              <th className="px-3 py-3 font-medium">NPS</th>
              <th className="px-3 py-3 font-medium">診断満足度</th>
              <th className="px-3 py-3 font-medium">Drop 第一印象</th>
              <th className="px-3 py-3 font-medium">チャット初手</th>
              <th className="px-3 py-3 font-medium">安心感</th>
              <th className="px-3 py-3 font-medium">コメント</th>
              <th className="px-3 py-3 font-medium">ネガ強度</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr key={response.id} className="border-b border-border/70 align-top last:border-none">
                <td className="px-3 py-4">
                  <Link href={`/admin/responses/${response.id}`} className="space-y-1 hover:underline">
                    <div className="font-medium text-foreground">{response.respondentCode}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(response.submittedAt ?? response.updatedAt)}</div>
                  </Link>
                </td>
                <td className="px-3 py-4">
                  <Badge variant={response.status === "submitted" ? "success" : "outline"}>
                    {response.status === "submitted" ? "完了" : "途中"}
                  </Badge>
                </td>
                <td className="px-3 py-4">{response.summary.nps ?? "-"}</td>
                <td className="px-3 py-4">{response.summary.diagnosisSatisfaction ?? "-"}</td>
                <td className="px-3 py-4">
                  {response.summary.dropFirstImpression
                    ? formatAnswerValue("drop_first_impression", response.summary.dropFirstImpression)
                    : "-"}
                </td>
                <td className="px-3 py-4">{response.summary.chatEase ?? "-"}</td>
                <td className="px-3 py-4">
                  {response.summary.comfortScore !== null
                    ? response.summary.comfortScore.toFixed(1)
                    : "-"}
                </td>
                <td className="px-3 py-4">
                  <Badge variant={response.summary.hasComment ? "muted" : "outline"}>
                    {response.summary.hasComment ? "あり" : "なし"}
                  </Badge>
                </td>
                <td className="px-3 py-4">{response.summary.negativeIntensity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
