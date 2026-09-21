"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { TimerIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CycleTimePoint } from "./analytics-api";

interface CycleTimeChartProps {
  data: CycleTimePoint[];
  isLoading?: boolean;
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days}d`;
}

export function CycleTimeChart({ data, isLoading }: CycleTimeChartProps) {
  const chartData = useMemo(
    () =>
      data.map((p) => ({
        ...p,
        week: new Date(p.weekStart).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })),
    [data],
  );

  const hasData = chartData.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <TimerIcon className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Cycle time</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Complete tasks to see cycle time trends.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatHours(v)} />
              <Tooltip formatter={(value) => [formatHours(Number(value)), undefined]} />
              <Legend />
              <Bar
                dataKey="p50"
                name="P50 (median)"
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
              <Bar dataKey="p75" name="P75" fill="hsl(35, 92%, 55%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="p95" name="P95" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
