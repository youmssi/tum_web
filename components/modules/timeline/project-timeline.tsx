"use client";

import { CalendarRangeIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Task,
  TaskDetailSheet,
  useRescheduleTask,
  useTasks,
} from "@/components/modules/tasks";
import { GanttChart, type GanttTask, type GanttViewMode } from "./gantt-chart";
import { dependencyApi } from "./dependency-api";
import { DEP_KEYS } from "./use-timeline";
import { useQuery } from "@tanstack/react-query";

const STATUS_PROGRESS: Record<Task["status"], number> = {
  TODO: 0,
  IN_PROGRESS: 30,
  IN_REVIEW: 70,
  DONE: 100,
};

const VIEW_MODES: GanttViewMode[] = ["Day", "Week", "Month"];

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const reschedule = useRescheduleTask(projectId);
  const [viewMode, setViewMode] = useState<GanttViewMode>("Week");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: allDeps } = useQuery({
    queryKey: DEP_KEYS.forProject(projectId),
    queryFn: async () => {
      if (!tasks?.length) return [];
      const sets = await Promise.all(tasks.map((t) => dependencyApi.listForTask(t.id)));
      const seen = new Set<string>();
      return sets.flat().filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });
    },
    enabled: !!tasks,
  });

  const depMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (allDeps ?? []).forEach((d) => {
      if (!map[d.toTaskId]) map[d.toTaskId] = [];
      map[d.toTaskId].push(d.fromTaskId);
    });
    return map;
  }, [allDeps]);

  const scheduledTasks = useMemo(
    () => (tasks ?? []).filter((t) => t.startDate && t.endDate),
    [tasks],
  );
  const unscheduledTasks = useMemo(
    () => (tasks ?? []).filter((t) => !t.startDate || !t.endDate),
    [tasks],
  );

  const ganttTasks: GanttTask[] = useMemo(
    () =>
      scheduledTasks.map((t) => ({
        id: t.id,
        name: t.title,
        start: t.startDate!,
        end: t.endDate!,
        progress: STATUS_PROGRESS[t.status],
        dependencies: depMap[t.id]?.join(",") ?? "",
      })),
    [scheduledTasks, depMap],
  );

  const handleDateChange = useCallback(
    async (ganttTask: GanttTask, start: Date, end: Date) => {
      try {
        await reschedule.mutateAsync({
          id: ganttTask.id as string,
          startDate: formatDate(start),
          endDate: formatDate(end),
        });
      } catch {
        toast.error("Failed to reschedule task.");
      }
    },
    [reschedule],
  );

  const handleClick = useCallback(
    (ganttTask: GanttTask) => {
      const task = tasks?.find((t) => t.id === ganttTask.id);
      if (task) {
        setSelectedTask(task);
        setSheetOpen(true);
      }
    },
    [tasks],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {VIEW_MODES.map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(mode)}
          >
            {mode}
          </Button>
        ))}
      </div>

      {ganttTasks.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border">
          <GanttChart
            tasks={ganttTasks}
            viewMode={viewMode}
            onClick={handleClick}
            onDateChange={handleDateChange}
            options={{ readonly_progress: true }}
          />
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <CalendarRangeIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No scheduled tasks. Open a task and set start &amp; end dates to see it here.
          </p>
        </div>
      )}

      {unscheduledTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Unscheduled ({unscheduledTasks.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
                onClick={() => {
                  setSelectedTask(t);
                  setSheetOpen(true);
                }}
              >
                {t.title}
                <Badge variant="secondary" className="text-xs">
                  {t.status.replace("_", " ")}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projectId={projectId}
      />
    </div>
  );
}
