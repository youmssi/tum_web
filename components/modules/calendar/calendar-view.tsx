"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  CalendarDaysIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDirectory } from "@/components/modules/organization";
import { useTasks, useUpdateTask } from "@/components/modules/tasks/use-tasks";
import { type Task } from "@/components/modules/tasks/task-api";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  projectId: string;
}

type ViewMode = "month" | "week";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
  IN_REVIEW: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
  DONE: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400 line-through opacity-60",
};

function TaskCard({ task }: { task: Task }) {
  const { data: directory } = useDirectory();
  const assignee = task.assigneeId
    ? directory?.find((m) => m.userId === task.assigneeId)
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group cursor-grab rounded border px-1.5 py-1 text-xs transition-all hover:shadow-md active:cursor-grabbing",
        STATUS_COLORS[task.status] ?? "bg-card",
        task.milestone && "border-l-2 border-l-amber-500 font-medium",
      )}
      title={`${task.title}${assignee ? ` — ${assignee.name}` : ""}`}
    >
      <div className="line-clamp-1">
        {task.milestone && (
          <span className="mr-1 text-amber-500">◆</span>
        )}
        {task.title}
      </div>
      {assignee && (
        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
          {assignee.name}
        </span>
      )}
    </div>
  );
}

function CalendarDay({
  day,
  tasks,
  currentMonth,
  onDateDrop,
}: {
  day: Date;
  tasks: Task[];
  currentMonth: Date;
  onDateDrop: (taskId: string, date: string) => void;
}) {
  const isOutside = !isSameMonth(day, currentMonth);
  const today = isToday(day);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onDateDrop(taskId, format(day, "yyyy-MM-dd"));
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "group relative flex min-h-[90px] flex-col gap-0.5 border-r border-b border-border p-1 transition-colors",
        isOutside && "bg-muted/30",
        today && "bg-accent/30",
      )}
    >
      <span
        className={cn(
          "sticky top-0 z-10 mb-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
          today && "bg-primary text-primary-foreground",
          isOutside && "text-muted-foreground/50",
        )}
      >
        {format(day, "d")}
      </span>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {tasks.slice(0, 3).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length > 3 && (
          <span className="text-[10px] text-muted-foreground">
            +{tasks.length - 3} more
          </span>
        )}
      </div>
      {tasks.length === 0 && (
        <div className="invisible flex-1 group-hover:visible">
          <span className="block rounded border border-dashed border-border/50 px-1 py-0.5 text-[10px] text-muted-foreground/40">
            Drop to set due date
          </span>
        </div>
      )}
    </div>
  );
}

function CalendarWeekHeader() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="grid grid-cols-7 border-b border-border">
      {days.map((d) => (
        <div
          key={d}
          className="border-r border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground last:border-r-0"
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function WeekView({
  weekStart,
  tasksByDate,
  onDateDrop,
}: {
  weekStart: Date;
  tasksByDate: Map<string, Task[]>;
  onDateDrop: (taskId: string, date: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        // In week view, show ALL tasks for the day without truncation
        const dayTasks = tasksByDate.get(key) ?? [];
        return (
          <div
            key={key}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) onDateDrop(taskId, key);
            }}
            className={cn(
              "flex min-h-[120px] flex-col gap-1 border-r border-b border-border p-1.5",
              isToday(day) && "bg-accent/30",
            )}
          >
            <span className={cn(
              "flex size-6 items-center justify-center rounded-full text-sm font-medium",
              isToday(day) && "bg-primary text-primary-foreground",
            )}>
              {format(day, "d")}
            </span>
            <div className="flex flex-col gap-1">
              {dayTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateTask = useUpdateTask();
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start from the current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [weekOffset, setWeekOffset] = useState(0);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    if (!tasks) return map;

    for (const task of tasks) {
      // Group by dueDate, startDate, and endDate
      const dates: string[] = [];
      if (task.dueDate) dates.push(task.dueDate);
      if (task.startDate && !dates.includes(task.startDate)) dates.push(task.startDate);
      if (task.endDate && !dates.includes(task.endDate)) dates.push(task.endDate);

      for (const date of dates) {
        const existing = map.get(date) ?? [];
        existing.push(task);
        map.set(date, existing);
      }
    }
    return map;
  }, [tasks]);

  async function handleDateDrop(taskId: string, newDate: string) {
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assigneeId,
          dueDate: newDate,
          labels: task.labels,
        },
      });
      toast.success("Task rescheduled.");
    } catch {
      toast.error("Failed to reschedule task.");
    }
  }

  function prevMonth() {
    if (viewMode === "week") {
      setWeekOffset((o) => o - 1);
    } else {
      setCurrentMonth((m) => subMonths(m, 1));
    }
  }

  function nextMonth() {
    if (viewMode === "week") {
      setWeekOffset((o) => o + 1);
    } else {
      setCurrentMonth((m) => addMonths(m, 1));
    }
  }

  function goToToday() {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setWeekOffset(0);
  }

  const headerLabel = useMemo(() => {
    if (viewMode === "week") {
      const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
    }
    return format(currentMonth, "MMMM yyyy");
  }, [currentMonth, viewMode, weekOffset]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks = useMemo(() => {
    if (viewMode === "week") {
      const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
      return [[weekStart]];
    }
    const w: Date[][] = [];
    let cursor = calStart;
    while (cursor <= calEnd) {
      const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
      w.push(week);
      cursor = addDays(cursor, 7);
    }
    return w;
  }, [calStart, calEnd, viewMode, weekOffset]);

  // Compute task counts for the month header
  const monthTaskCount = useMemo(() => {
    let count = 0;
    if (!tasks) return 0;
    for (const task of tasks) {
      if (task.dueDate && isSameMonth(new Date(task.dueDate), currentMonth)) count++;
    }
    return count;
  }, [tasks, currentMonth]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <Empty className="min-h-64 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDaysIcon />
          </EmptyMedia>
          <EmptyTitle>No tasks to show on the calendar</EmptyTitle>
          <EmptyDescription>
            Create tasks with due dates to see them on the calendar.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={prevMonth}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday} className="gap-1 text-sm font-medium">
            <SunIcon className="size-3.5" />
            {headerLabel}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={nextMonth}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {monthTaskCount} task{monthTaskCount !== 1 ? "s" : ""} with dates
          </span>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => {
              if (v) setViewMode(v as ViewMode);
            }}
            size="sm"
          >
            <ToggleGroupItem value="month" className="h-8 gap-1 text-xs">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="h-8 gap-1 text-xs">
              Week
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded border border-amber-500/30 bg-amber-500/10" />
          Milestone
        </span>
        <span className="text-muted-foreground/50">
          Drag a task card to a date cell to reschedule its due date
        </span>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border">
        <CalendarWeekHeader />
        {viewMode === "week" ? (
          <WeekView
            weekStart={addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)}
            tasksByDate={tasksByDate}
            onDateDrop={handleDateDrop}
          />
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => (
                <CalendarDay
                  key={day.toISOString()}
                  day={day}
                  tasks={tasksByDate.get(format(day, "yyyy-MM-dd")) ?? []}
                  currentMonth={currentMonth}
                  onDateDrop={handleDateDrop}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
