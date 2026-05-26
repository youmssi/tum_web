"use client";

import { CalendarRangeIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Task,
  TaskDetailSheet,
  useRescheduleTask,
  useTasks,
  useUpdateProgress,
  useToggleMilestone,
} from "@/components/modules/tasks";
import { useTimelineColors } from "./timeline-colors-store";
import { GanttChart, type GanttTask, type GanttViewMode } from "./gantt-chart";
import { dependencyApi } from "./dependency-api";
import {
  DEP_KEYS,
  useCreateDependency,
  useDeleteDependency,
  type DependencyType,
} from "./use-timeline";
import { TimelineToolbar } from "./timeline-toolbar";
import { TimelineLeftPanel, GANTT_ROW_HEIGHT } from "./timeline-left-panel";

const GANTT_OPTIONS = {
  bar_height: 28,
  padding: 12,
  readonly_progress: false,
} as const;

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function taskColorClass(task: Task, nearDueDays: number): string {
  if (!task.endDate || task.status === "DONE") return "tum-on-track";
  const end = new Date(task.endDate).getTime();
  const now = Date.now();
  if (end < now) return "tum-overdue";
  if (end - now < nearDueDays * 86400000) return "tum-near-due";
  return "tum-on-track";
}

const DEP_TYPE_OPTIONS: { value: DependencyType; label: string }[] = [
  { value: "FINISH_TO_START", label: "Finish → Start" },
  { value: "START_TO_START", label: "Start → Start" },
  { value: "FINISH_TO_FINISH", label: "Finish → Finish" },
  { value: "START_TO_FINISH", label: "Start → Finish" },
];

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const reschedule = useRescheduleTask(projectId);
  const updateProgress = useUpdateProgress(projectId);
  const toggleMilestone = useToggleMilestone(projectId);
  const createDependency = useCreateDependency();
  const deleteDependency = useDeleteDependency();
  const { getConfig } = useTimelineColors();
  const colors = getConfig(projectId);

  const [viewMode, setViewMode] = useState<GanttViewMode>("Week");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [linkTarget, setLinkTarget] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Dismiss link mode on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && linkMode) {
        setLinkMode(false);
        setLinkSource(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [linkMode]);

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

  const scheduledTaskIds = useMemo(
    () => new Set(scheduledTasks.map((t) => t.id)),
    [scheduledTasks],
  );

  const ganttTasks: GanttTask[] = useMemo(() => {
    const today = todayStr();
    return scheduledTasks.map((t) => {
      const start = t.milestone ? (t.startDate ?? t.endDate ?? today) : t.startDate!;
      const end = t.milestone ? (t.startDate ?? t.endDate ?? today) : t.endDate!;
      const colorClass = taskColorClass(t, colors.nearDueDays);
      return {
        id: t.id,
        name: t.title,
        start,
        end,
        progress: t.progress,
        dependencies: depMap[t.id]?.join(",") ?? "",
        custom_class: t.milestone ? `${colorClass} tum-milestone` : colorClass,
      };
    });
  }, [scheduledTasks, depMap, colors.nearDueDays]);

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

  const handleProgressChange = useCallback(
    async (ganttTask: GanttTask, progress: number) => {
      const task = tasks?.find((t) => t.id === ganttTask.id);
      if (!task) return;
      try {
        await updateProgress.mutateAsync({ task, progress });
      } catch {
        toast.error("Failed to update progress.");
      }
    },
    [tasks, updateProgress],
  );

  const handleGanttClick = useCallback(
    (ganttTask: GanttTask) => {
      const id = ganttTask.id as string;
      if (linkMode) {
        if (!linkSource) {
          setLinkSource(id);
          toast.info("Now click the target task to create a dependency.");
        } else if (linkSource === id) {
          setLinkSource(null);
        } else {
          setLinkTarget(id);
          setLinkDialogOpen(true);
        }
        return;
      }
      const task = tasks?.find((t) => t.id === id);
      if (task) {
        setSelectedTask(task);
        setSheetOpen(true);
      }
    },
    [linkMode, linkSource, tasks],
  );

  async function confirmLink(type: DependencyType) {
    if (!linkSource || !linkTarget) return;
    try {
      await createDependency.mutateAsync({ fromTaskId: linkSource, toTaskId: linkTarget, type });
      toast.success("Dependency created.");
    } catch {
      toast.error("Failed to create dependency.");
    } finally {
      setLinkDialogOpen(false);
      setLinkSource(null);
      setLinkTarget(null);
      setLinkMode(false);
    }
  }

  // Synchronized vertical scroll
  const syncingRef = useRef(false);

  function onLeftScroll() {
    if (syncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    syncingRef.current = true;
    rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    syncingRef.current = false;
  }

  function onRightScroll() {
    if (syncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    syncingRef.current = true;
    leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    syncingRef.current = false;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  const linkSourceTask = tasks?.find((t) => t.id === linkSource);
  const linkTargetTask = tasks?.find((t) => t.id === linkTarget);

  return (
    <div className="space-y-4">
      {/* Dynamic color CSS for Frappe Gantt custom classes */}
      <style>{`
        .tum-on-track .bar { fill: ${colors.onTrackColor} !important; }
        .tum-on-track .bar-progress { fill: color-mix(in srgb, ${colors.onTrackColor} 70%, black) !important; }
        .tum-near-due .bar { fill: ${colors.nearDueColor} !important; }
        .tum-near-due .bar-progress { fill: color-mix(in srgb, ${colors.nearDueColor} 70%, black) !important; }
        .tum-overdue .bar { fill: ${colors.overdueColor} !important; }
        .tum-overdue .bar-progress { fill: color-mix(in srgb, ${colors.overdueColor} 70%, black) !important; }
        .tum-milestone .bar {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important;
          rx: 0 !important;
        }
        .gantt-container { cursor: ${linkMode ? "crosshair" : "default"}; }
        @media print {
          body > * { display: none !important; }
          .tum-gantt-print { display: block !important; }
        }
      `}</style>

      <TimelineToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        linkMode={linkMode}
        onLinkModeChange={(active) => {
          setLinkMode(active);
          if (!active) setLinkSource(null);
        }}
        colors={colors}
        ganttContainerRef={ganttContainerRef}
      />

      {ganttTasks.length === 0 && (tasks ?? []).length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <CalendarRangeIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No tasks yet. Create tasks and set dates to see them here.
          </p>
        </div>
      ) : (
        /*
         * Explicit height is required for react-resizable-panels to work.
         * Without it, h-full on PanelGroup resolves to `auto` and the drag
         * handle has no bounded height to resize within.
         */
        <div
          className="overflow-hidden rounded-xl border tum-gantt-print"
          ref={ganttContainerRef}
          style={{ height: "calc(100svh - 18rem)", minHeight: "520px" }}
        >
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            {/* Left panel — task list */}
            <ResizablePanel defaultSize={28} minSize={18} maxSize={45} className="flex flex-col">
              {/* Sticky column headers */}
              <TimelineLeftPanel
                tasks={tasks ?? []}
                scheduledTaskIds={scheduledTaskIds}
                allDeps={allDeps ?? []}
                expandedTaskId={expandedTaskId}
                onExpandToggle={(id) => setExpandedTaskId((prev) => (prev === id ? null : id))}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setSheetOpen(true);
                }}
                onProgressChange={(task, progress) =>
                  updateProgress
                    .mutateAsync({ task, progress })
                    .catch(() => toast.error("Failed to update progress."))
                }
                onMilestoneToggle={(task) =>
                  toggleMilestone
                    .mutateAsync(task)
                    .catch(() => toast.error("Failed to toggle milestone."))
                }
                onDeleteDependency={(dep) =>
                  deleteDependency
                    .mutateAsync({
                      id: dep.id,
                      fromTaskId: dep.fromTaskId,
                      toTaskId: dep.toTaskId,
                    })
                    .catch(() => toast.error("Failed to remove dependency."))
                }
                onDateChange={(task, field, date) =>
                  reschedule
                    .mutateAsync({
                      id: task.id,
                      startDate: field === "start" ? date : task.startDate,
                      endDate: field === "end" ? date : task.endDate,
                    })
                    .catch(() => toast.error("Failed to update date."))
                }
                linkMode={linkMode}
                linkSourceId={linkSource}
                leftScrollRef={leftScrollRef}
                onScroll={onLeftScroll}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right panel — Gantt bars */}
            <ResizablePanel defaultSize={72}>
              <div ref={rightScrollRef} onScroll={onRightScroll} className="h-full overflow-auto">
                {ganttTasks.length > 0 ? (
                  <GanttChart
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onClick={handleGanttClick}
                    onDateChange={handleDateChange}
                    onProgressChange={handleProgressChange}
                    options={GANTT_OPTIONS}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center text-sm text-muted-foreground"
                    style={{
                      height: Math.max(
                        200,
                        (tasks ?? []).length * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT,
                      ),
                    }}
                  >
                    Add start &amp; end dates to tasks to see bars here.
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}

      {/* Dependency type dialog */}
      <Dialog
        open={linkDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setLinkDialogOpen(false);
            setLinkTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create dependency</DialogTitle>
            <DialogDescription>
              {linkSourceTask?.title} → {linkTargetTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">Select dependency type:</p>
            <div className="grid gap-2">
              {DEP_TYPE_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant="outline"
                  className="justify-start"
                  onClick={() => confirmLink(value)}
                  disabled={createDependency.isPending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projectId={projectId}
      />
    </div>
  );
}
