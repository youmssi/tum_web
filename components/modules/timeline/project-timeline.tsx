"use client";

import { CalendarRangeIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { formatLocalDate, parseLocalDate, todayLocalDate } from "@/lib/date";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  GanttChart,
  type GanttChartHandle,
  type GanttTask,
  type GanttViewMode,
} from "./gantt-chart";
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
  // Frappe Gantt's built-in today line + button are enabled so the vertical "today" reference
  // line renders on the chart. The button element is hidden via CSS ('.gantt .side-header > *')
  // because we have our own in the toolbar — see the .project-timeline-chart styles below.
} as const;

const LEFT_PANEL_MIN = 240;
const LEFT_PANEL_MAX = 600;

function taskColorClass(task: Task, nearDueDays: number): string {
  if (!task.endDate || task.status === "DONE") return "tum-on-track";
  const end = parseLocalDate(task.endDate).getTime();
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

export function ProjectTimeline({
  projectId,
  dateRange,
}: {
  projectId: string;
  dateRange?: DateRange;
}) {
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
  const [linkLagDays, setLinkLagDays] = useState(0);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const queryClient = useQueryClient();

  // Left panel width — "28%" initially (adapts to any viewport), pixel value after user drags.
  const [leftWidth, setLeftWidth] = useState<number | string>("28%");
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);

  function handleDragStart(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    // Read actual rendered width so dragging starts from the right pixel position
    const leftEl = e.currentTarget.previousElementSibling as HTMLElement | null;
    const currentW = leftEl?.offsetWidth ?? LEFT_PANEL_MIN;
    dragRef.current = { startX: e.clientX, startW: currentW };
  }

  function handleDragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    setLeftWidth(
      Math.max(LEFT_PANEL_MIN, Math.min(LEFT_PANEL_MAX, dragRef.current.startW + delta)),
    );
  }

  function handleDragEnd() {
    dragRef.current = null;
  }

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttHandleRef = useRef<GanttChartHandle | null>(null);

  // Dismiss link mode and focus mode on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isFocused) {
          setIsFocused(false);
        } else if (linkMode) {
          setLinkMode(false);
          setLinkSource(null);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [linkMode, isFocused]);

  const { data: allDeps } = useQuery({
    queryKey: DEP_KEYS.forProject(projectId),
    queryFn: () => dependencyApi.listForProject(projectId),
    enabled: !!projectId,
  });

  const depMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (allDeps ?? []).forEach((d) => {
      if (!map[d.toTaskId]) map[d.toTaskId] = [];
      map[d.toTaskId].push(d.fromTaskId);
    });
    return map;
  }, [allDeps]);

  const scheduledTasks = useMemo(() => {
    return (tasks ?? []).filter((t) => {
      if (!t.startDate || !t.endDate) return false;
      if (!dateRange?.from && !dateRange?.to) return true;
      const start = parseLocalDate(t.startDate);
      const end = parseLocalDate(t.endDate);
      if (dateRange.to && start > dateRange.to) return false;
      if (dateRange.from && end < dateRange.from) return false;
      return true;
    });
  }, [tasks, dateRange]);

  const scheduledTaskIds = useMemo(
    () => new Set(scheduledTasks.map((t) => t.id)),
    [scheduledTasks],
  );

  const ganttTasks: GanttTask[] = useMemo(() => {
    const today = todayLocalDate();
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
        custom_class: t.milestone ? `${colorClass}-milestone` : colorClass,
      };
    });
  }, [scheduledTasks, depMap, colors.nearDueDays]);

  const handleDateChange = useCallback(
    async (ganttTask: GanttTask, start: Date, end: Date) => {
      try {
        const result = await dependencyApi.reschedule(ganttTask.id as string, {
          startDate: formatLocalDate(start),
          endDate: formatLocalDate(end),
        });
        if (result.autoShiftedTasks.length > 0) {
          toast.success(
            `${result.autoShiftedTasks.length} dependent task${result.autoShiftedTasks.length === 1 ? " was" : "s were"} auto-shifted.`,
          );
        }
        if (result.conflicts.length > 0) {
          for (const conflict of result.conflicts) {
            toast.warning(conflict, { duration: 8000 });
          }
        }
        // Refresh tasks to reflect shifted dates
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      } catch {
        toast.error("Failed to reschedule task.");
      }
    },
    [projectId, queryClient],
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
      await createDependency.mutateAsync({
        fromTaskId: linkSource,
        toTaskId: linkTarget,
        type,
        lagDays: linkLagDays > 0 ? linkLagDays : undefined,
      });
      toast.success("Dependency created.");
    } catch {
      toast.error("Failed to create dependency.");
    } finally {
      setLinkDialogOpen(false);
      setLinkSource(null);
      setLinkTarget(null);
      setLinkMode(false);
      setLinkLagDays(0);
    }
  }

  // Synchronized vertical scroll between left task list and right Gantt panel
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
    <div
      className={cn(
        "flex min-h-0 flex-col gap-3",
        !isFocused && "flex-1",
        isFocused && "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background p-4",
      )}
    >
      {/* Dynamic color CSS for Frappe Gantt custom classes */}
      <style>{`
        .tum-on-track .bar { fill: ${colors.onTrackColor} !important; }
        .tum-on-track .bar-progress { fill: color-mix(in srgb, ${colors.onTrackColor} 70%, black) !important; }
        .tum-near-due .bar { fill: ${colors.nearDueColor} !important; }
        .tum-near-due .bar-progress { fill: color-mix(in srgb, ${colors.nearDueColor} 70%, black) !important; }
        .tum-overdue .bar { fill: ${colors.overdueColor} !important; }
        .tum-overdue .bar-progress { fill: color-mix(in srgb, ${colors.overdueColor} 70%, black) !important; }
        .tum-on-track-milestone .bar { fill: ${colors.onTrackColor} !important; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important; }
        .tum-near-due-milestone .bar { fill: ${colors.nearDueColor} !important; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important; }
        .tum-overdue-milestone .bar { fill: ${colors.overdueColor} !important; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important; }
        .gantt-container { cursor: ${linkMode ? "crosshair" : "default"}; }
        /* Frappe ships overflow:auto on .gantt-container — we scroll the outer panel instead
           so the chart doesn't stack a second vertical scrollbar beside the page. */
        .project-timeline-chart .gantt-container {
          overflow: visible !important;
          height: auto !important;
        }
        /* Hide Frappe Gantt's built-in side-header toolbar (view-mode select + today button)
           because we render our own in the TimelineToolbar component. The today reference line
           (vertical line on today's date) is drawn by Frappe Gantt's draw_today() and remains
           visible — only the interactive controls in the sticky header are suppressed. */
        .project-timeline-chart .gantt-container .side-header { display: none !important; }
      `}</style>

      <div className="shrink-0">
        <TimelineToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          linkMode={linkMode}
          onLinkModeChange={(active) => {
            setLinkMode(active);
            if (!active) setLinkSource(null);
          }}
          colors={colors}
          isFocused={isFocused}
          onFocusToggle={() => setIsFocused((f) => !f)}
          onJumpToToday={() => ganttHandleRef.current?.scrollToToday()}
        />
      </div>

      {ganttTasks.length === 0 && (tasks ?? []).length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <CalendarRangeIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No tasks yet. Create tasks and set dates to see them here.
          </p>
        </div>
      ) : (
        /*
         * Height: flex-1 min-h-0 inside the project tab column (no viewport calc) so only
         * the chart panels scroll — not the whole page + chart at once.
         * Width: right panel is the single scroll owner (horizontal + vertical); Frappe's
         * .gantt-container overflow is disabled via .project-timeline-chart above.
         */
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 overflow-hidden rounded-xl border",
            isFocused ? "min-h-0" : "min-h-96",
          )}
          ref={ganttContainerRef}
        >
          {/* Left panel — adaptive width: 28% of container initially, pixel value after drag */}
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: leftWidth,
              minWidth: LEFT_PANEL_MIN,
              maxWidth: LEFT_PANEL_MAX,
              flexShrink: 0,
            }}
          >
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
                  .then(() => {
                    toast.success("Dependency removed.", {
                      action: {
                        label: "Undo",
                        onClick: () =>
                          createDependency
                            .mutateAsync({
                              fromTaskId: dep.fromTaskId,
                              toTaskId: dep.toTaskId,
                              type: dep.type,
                            })
                            .catch(() => toast.error("Failed to restore dependency.")),
                      },
                      duration: 6000,
                    });
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
          </div>

          {/* Drag handle — pointer-capture resize; double-click resets to adaptive 28% */}
          <div
            className="relative w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary/40 active:bg-primary/70 touch-none select-none"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onDoubleClick={() => setLeftWidth("28%")}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
          >
            {/* Visual grip dots */}
            <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center gap-1 opacity-40">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-0.5 rounded-full bg-foreground" />
              ))}
            </div>
          </div>

          {/* Right panel — Gantt bars, scrollable in both directions */}
          <div
            ref={rightScrollRef}
            onScroll={onRightScroll}
            className="flex-1 min-h-0 min-w-0 overflow-auto overscroll-contain"
          >
            {ganttTasks.length > 0 ? (
              <div className="project-timeline-chart min-w-max">
                <GanttChart
                  ref={ganttHandleRef}
                  tasks={ganttTasks}
                  viewMode={viewMode}
                  onClick={handleGanttClick}
                  onDateChange={handleDateChange}
                  onProgressChange={handleProgressChange}
                  options={GANTT_OPTIONS}
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-center text-sm text-muted-foreground"
                style={{
                  height: Math.max(200, (tasks ?? []).length * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT),
                }}
              >
                {dateRange?.from || dateRange?.to
                  ? "No tasks fall within the selected date range."
                  : "Add start & end dates to tasks to see bars here."}
              </div>
            )}
          </div>
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
        {" "}
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create dependency</DialogTitle>
            <DialogDescription>
              {linkSourceTask?.title} → {linkTargetTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Select dependency type:</p>
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
            <div>
              <label className="block text-sm text-muted-foreground">Lag / lead (days)</label>
              <p className="mb-1.5 text-xs text-muted-foreground/70">
                Positive = delay, negative = overlap. Zero is default.
              </p>
              <Input
                type="number"
                min={0}
                value={linkLagDays}
                onChange={(e) => setLinkLagDays(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
              />
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
