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
import { AlertCircleIcon, CheckCircle2Icon, ListTodoIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed } from "@/components/modules/activity";
import { useTasks } from "@/components/modules/tasks/use-tasks";
import { type TaskStatus, STATUS_LABELS } from "@/components/modules/tasks/task-api";
import { useProjectMetrics } from "./use-analytics";

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-muted",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-amber-500",
  DONE: "bg-green-500",
};

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`size-4 ${highlight && value > 0 ? "text-destructive" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${highlight && value > 0 ? "text-destructive" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { data: metrics, isLoading: metricsLoading } = useProjectMetrics(projectId);

  const today = new Date().toISOString().slice(0, 10);

  const statusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    (tasks ?? []).forEach((t) => { counts[t.status]++; });
    return counts;
  }, [tasks]);

  const overdueCount = useMemo(
    () => (tasks ?? []).filter((t) => t.dueDate && t.dueDate < today && t.status !== "DONE").length,
    [tasks, today],
  );

  const total = tasks?.length ?? 0;

  const trendData = useMemo(
    () =>
      (metrics?.completionTrend ?? []).map((p) => ({
        ...p,
        date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      })),
    [metrics],
  );

  if (tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ListTodoIcon} label="Total tasks" value={total} />
        <StatCard icon={AlertCircleIcon} label="Overdue" value={overdueCount} highlight />
        <StatCard icon={CheckCircle2Icon} label="Done" value={statusCounts.DONE} />
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as TaskStatus[]).map((status) => {
            const count = statusCounts[status];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{STATUS_LABELS[status]}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_COLORS[status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Completion trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Completion trend</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !trendData.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trend data yet. Complete tasks to see progress.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
