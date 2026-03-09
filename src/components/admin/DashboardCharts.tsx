"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

import type { DashboardData } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const palette = ["#46605D", "#6B857F", "#9DB2A5", "#C4D0C6", "#E2E8E2"];

export function DashboardCharts({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Drop 第一印象の分布</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.distributions.dropFirstImpression}>
              <CartesianGrid vertical={false} stroke="#d8ddd7" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                {data.distributions.dropFirstImpression.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NPS 分布</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.distributions.nps}>
              <CartesianGrid vertical={false} stroke="#d8ddd7" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#46605D" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>セクション別離脱ファネル</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.sectionFunnel} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid horizontal={false} stroke="#d8ddd7" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="title" width={90} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#6B857F" radius={[0, 12, 12, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>回答送信の時系列</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.distributions.submissionTimeline}>
              <CartesianGrid vertical={false} stroke="#d8ddd7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#46605D"
                strokeWidth={3}
                dot={{ r: 4, fill: "#46605D" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
