"use client";

import { ChevronDownIcon, ChevronRightIcon, DiamondIcon, Trash2Icon } from "lucide-react";
import { type RefObject, useRef, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLocalDate, parseLocalDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useDirectory, type DirectoryMember } from "@/components/modules/organization";
import { type Task } from "@/components/modules/tasks";
import { DEPENDENCY_TYPE_LABELS, type Dependency } from "./dependency-api";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Compact label for a yyyy-MM-dd date: "Jun 1" if this year, else "Jun 1 '26". Empty → em-dash. */
function shortDateLabel(value: string | null): string {
  if (!value) return "—";
  const d = parseLocalDate(value);
  const month = MONTH_SHORT[d.getMonth()];
  const day = d.getDate();
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return sameYear ? `${month} ${day}` : `${month} ${day} '${String(d.getFullYear()).slice(-2)}`;
}

function DateCell({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (date: string | null) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="w-16 shrink-0 rounded px-1 text-xs text-muted-foreground hover:bg-muted/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={label}
        >
          {shortDateLabel(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Calendar
          mode="single"
          selected={value ? parseLocalDate(value) : undefined}
          onSelect={(date) => {
            onChange(date ? formatLocalDate(date) : null);
            setOpen(false);
          }}
        />
        {value && (
          <div className="border-t p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Must match Frappe Gantt bar_height (28) + padding (12) = 40px
export const GANTT_ROW_HEIGHT = 40;

interface Props {
  tasks: Task[];
  scheduledTaskIds: Set<string>;
  allDeps: Dependency[];
  expandedTaskId: string | null;
  onExpandToggle: (id: string) => void;
  onOpenTask: (task: Task) => void;
  onProgressChange: (task: Task, progress: number) => void;
  onMilestoneToggle: (task: Task) => void;
  onDeleteDependency: (dep: Dependency) => void;
  onDateChange: (task: Task, field: "start" | "end", date: string | null) => void;
  linkMode: boolean;
  linkSourceId: string | null;
  /** Forwarded to the inner scrollable div for synchronized scroll with the Gantt panel. */
  leftScrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
}

function resolveAssignee(assigneeId: string | null, members: DirectoryMember[]) {
  if (!assigneeId) return null;
  const m = members.find((mem) => mem.userId === assigneeId);
  return m ? { name: m.name, initials: m.name.slice(0, 2).toUpperCase() } : null;
}

function TaskRow({
  task,
  outgoingDeps,
  subtasks,
  allTasks,
  expanded,
  onExpandToggle,
  onOpenTask,
  onOpenTaskById,
  onProgressChange,
  onMilestoneToggle,
  onDeleteDependency,
  onDateChange,
  members,
  linkMode,
  isLinkSource,
}: {
  task: Task;
  outgoingDeps: Dependency[];
  subtasks: Task[];
  allTasks: Task[];
  expanded: boolean;
  onExpandToggle: () => void;
  onOpenTask: () => void;
  onOpenTaskById: (id: string) => void;
  onProgressChange: (p: number) => void;
  onMilestoneToggle: () => void;
  onDeleteDependency: (dep: Dependency) => void;
  onDateChange: (field: "start" | "end", date: string | null) => void;
  members: DirectoryMember[];
  linkMode: boolean;
  isLinkSource: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const sliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assignee = resolveAssignee(task.assigneeId, members);

  function handleMouseEnter() {
    if (sliderTimeout.current) clearTimeout(sliderTimeout.current);
    setHovered(true);
  }
  function handleMouseLeave() {
    sliderTimeout.current = setTimeout(() => {
      if (!editingProgress) setHovered(false);
    }, 300);
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <>
      {/* Main row */}
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 border-b px-2 text-sm transition-colors hover:bg-muted/50",
          isLinkSource && "bg-primary/10 ring-1 ring-inset ring-primary/30",
        )}
        style={{ height: GANTT_ROW_HEIGHT }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (!linkMode) onOpenTask();
        }}
      >
        {/* Expand/collapse toggle (only when task has deps or is expandable) */}
        <button
          type="button"
          className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            stopProp(e);
            onExpandToggle();
          }}
          tabIndex={-1}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {outgoingDeps.length > 0 || subtasks.length > 0 ? (
            expanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )
          ) : (
            <span className="size-3.5" />
          )}
        </button>

        {/* Milestone toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 p-0.5"
                onClick={(e) => {
                  stopProp(e);
                  onMilestoneToggle();
                }}
                aria-label={task.milestone ? "Remove milestone" : "Mark as milestone"}
              >
                <DiamondIcon
                  className={cn(
                    "size-3.5 transition-colors",
                    task.milestone
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground/40 hover:text-muted-foreground",
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {task.milestone ? "Remove milestone" : "Mark as milestone"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Subtask indent + title */}
        <span className="min-w-0 flex-1 truncate" title={task.title}>
          {task.parentTaskId && <span className="mr-1 text-muted-foreground/50">↳</span>}
          <span className={task.parentTaskId ? "text-muted-foreground" : "font-medium"}>
            {task.title}
          </span>
        </span>

        {/* Assignee avatar */}
        {assignee ? (
          <Avatar className="ml-1 size-5 shrink-0">
            <AvatarFallback className="text-[9px]">{assignee.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="ml-1 size-5 shrink-0" />
        )}

        {/* Start date — popover calendar (replaces native input, saves ~24 px per cell) */}
        <DateCell
          value={task.startDate ?? null}
          onChange={(d) => onDateChange("start", d)}
          label={`Start date for ${task.title}`}
        />

        {/* End date — popover calendar */}
        <DateCell
          value={task.endDate ?? null}
          onChange={(d) => onDateChange("end", d)}
          label={`End date for ${task.title}`}
        />

        {/* Progress */}
        <div
          className="relative flex w-10 shrink-0 items-center justify-end"
          onClick={stopProp}
          onMouseEnter={() => setEditingProgress(true)}
          onMouseLeave={() => setEditingProgress(false)}
        >
          {hovered || editingProgress ? (
            <Slider
              min={0}
              max={100}
              step={5}
              value={[task.progress]}
              onValueChange={([val]) => onProgressChange(val)}
              className="w-16"
            />
          ) : (
            <span className="text-xs tabular-nums text-muted-foreground">{task.progress}%</span>
          )}
        </div>
      </div>

      {/* Expansion row — subtasks (↳ children of this task) and dependencies (→ downstream tasks)
          are shown as two distinct labelled sections so it's clear which is which. */}
      {expanded && (subtasks.length > 0 || outgoingDeps.length > 0) && (
        <div className="space-y-2 border-b bg-muted/20 px-6 py-1.5">
          {subtasks.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                Subtasks · {subtasks.length}
              </p>
              <div className="space-y-0.5">
                {subtasks.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-1 text-left text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTaskById(child.id);
                    }}
                  >
                    <span className="shrink-0 select-none text-muted-foreground/50">↳</span>
                    <span className="truncate flex-1">{child.title}</span>
                    {child.status === "DONE" && (
                      <span className="shrink-0 text-[10px] opacity-70">done</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {outgoingDeps.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                Dependencies · {outgoingDeps.length}
              </p>
              <div className="space-y-0.5">
                {outgoingDeps.map((dep) => {
                  const target = allTasks.find((t) => t.id === dep.toTaskId);
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="truncate flex-1">
                        → {target?.title ?? dep.toTaskId.slice(0, 8)}
                        <span className="ml-1 text-[10px] opacity-70">
                          ({DEPENDENCY_TYPE_LABELS[dep.type]})
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDependency(dep);
                        }}
                      >
                        <Trash2Icon className="size-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function TimelineLeftPanel({
  tasks,
  scheduledTaskIds,
  allDeps,
  expandedTaskId,
  onExpandToggle,
  onOpenTask,
  onProgressChange,
  onMilestoneToggle,
  onDeleteDependency,
  onDateChange,
  linkMode,
  linkSourceId,
  leftScrollRef,
  onScroll,
}: Props) {
  const { data: directory } = useDirectory();
  const members = directory ?? [];

  const outgoingDepsByTask = new Map<string, Dependency[]>();
  for (const dep of allDeps) {
    if (!outgoingDepsByTask.has(dep.fromTaskId)) outgoingDepsByTask.set(dep.fromTaskId, []);
    outgoingDepsByTask.get(dep.fromTaskId)!.push(dep);
  }

  // Children index: parentTaskId → ordered children. Used by the expand panel to surface
  // a task's subtasks alongside its dependencies (each in a clearly labelled section).
  const childrenByParent = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.parentTaskId) continue;
    if (!childrenByParent.has(t.parentTaskId)) childrenByParent.set(t.parentTaskId, []);
    childrenByParent.get(t.parentTaskId)!.push(t);
  }

  function openTaskById(id: string) {
    const target = tasks.find((t) => t.id === id);
    if (target) onOpenTask(target);
  }

  const scheduled = tasks.filter((t) => scheduledTaskIds.has(t.id));
  const unscheduled = tasks.filter((t) => !scheduledTaskIds.has(t.id));

  return (
    <div className="flex h-full flex-col overflow-hidden border-r">
      {/* Column header — sticky, not part of the scroll area */}
      <div
        className="flex shrink-0 items-center gap-1 border-b bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground"
        style={{ height: GANTT_ROW_HEIGHT }}
      >
        <span className="size-3.5 shrink-0" />
        <span className="size-3.5 shrink-0" />
        <span className="flex-1 truncate">Task</span>
        <span className="size-5 shrink-0" />
        <span className="w-16 shrink-0 text-center">Start</span>
        <span className="w-16 shrink-0 text-center">End</span>
        <span className="w-10 shrink-0 text-center">%</span>
      </div>

      {/*
       * Synced scroll — ONLY scheduled tasks mirror Gantt row positions.
       * Unscheduled tasks are rendered below in a separate non-synced section
       * so that copying scrollTop between left and right panels stays correct.
       */}
      <div
        ref={leftScrollRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        {scheduled.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            outgoingDeps={outgoingDepsByTask.get(task.id) ?? []}
            subtasks={childrenByParent.get(task.id) ?? []}
            allTasks={tasks}
            expanded={expandedTaskId === task.id}
            onExpandToggle={() => onExpandToggle(task.id)}
            onOpenTask={() => onOpenTask(task)}
            onOpenTaskById={openTaskById}
            onProgressChange={(p) => onProgressChange(task, p)}
            onMilestoneToggle={() => onMilestoneToggle(task)}
            onDeleteDependency={onDeleteDependency}
            onDateChange={(field, date) => onDateChange(task, field, date)}
            members={members}
            linkMode={linkMode}
            isLinkSource={linkSourceId === task.id}
          />
        ))}
      </div>

      {/* Unscheduled tasks — outside synced scroll, independent section */}
      {unscheduled.length > 0 && (
        <div className="shrink-0 border-t" style={{ maxHeight: "28%" }}>
          <div className="sticky top-0 z-10 border-b bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            Unscheduled · {unscheduled.length}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 24px)" }}>
            {unscheduled.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                outgoingDeps={outgoingDepsByTask.get(task.id) ?? []}
                subtasks={childrenByParent.get(task.id) ?? []}
                allTasks={tasks}
                expanded={expandedTaskId === task.id}
                onExpandToggle={() => onExpandToggle(task.id)}
                onOpenTask={() => onOpenTask(task)}
                onOpenTaskById={openTaskById}
                onProgressChange={(p) => onProgressChange(task, p)}
                onMilestoneToggle={() => onMilestoneToggle(task)}
                onDeleteDependency={onDeleteDependency}
                onDateChange={(field, date) => onDateChange(task, field, date)}
                members={members}
                linkMode={linkMode}
                isLinkSource={linkSourceId === task.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
