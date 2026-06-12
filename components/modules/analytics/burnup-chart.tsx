"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUpIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BurnupPoint } from "./analytics-api";

interface BurnupChartProps {
  data: BurnupPoint[];
  isLoading?: boolean;
}

export function BurnupChart({ data, isLoading }: BurnupChartProps) {
  const chartData = useMemo(
    () =>
      data.map((p) => ({
        ...p,
        date: new Date(p.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })),
    [data],
  );

  const hasData = chartData.some((p) => p.completed > 0);

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
        <TrendingUpIcon className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Burnup</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Complete tasks to see the burnup chart.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="scope"
                name="Scope (total)"
                stroke="hsl(var(--muted-foreground))"
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
              <Area
                type="stepBefore"
                dataKey="completed"
                name="Completed"
                stroke="hsl(142, 76%, 36%)"
                fill="hsl(142, 76%, 36%)"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
