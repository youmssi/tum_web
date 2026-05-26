"use client";

import { ChevronDownIcon, ChevronRightIcon, DiamondIcon, Trash2Icon } from "lucide-react";
import { type RefObject, useRef, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { type Task } from "@/components/modules/tasks";
import { DEPENDENCY_TYPE_LABELS, type Dependency } from "./dependency-api";

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

function resolveAssignee(
  assigneeId: string | null,
  members: NonNullable<ReturnType<typeof authClient.useActiveOrganization>["data"]>["members"],
) {
  if (!assigneeId) return null;
  const m = members.find((mem) => mem.userId === assigneeId);
  return m
    ? {
        name: m.user?.name ?? m.user?.email ?? "?",
        initials: (m.user?.name ?? m.user?.email ?? "?").slice(0, 2).toUpperCase(),
      }
    : null;
}

function TaskRow({
  task,
  outgoingDeps,
  allTasks,
  expanded,
  onExpandToggle,
  onOpenTask,
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
  allTasks: Task[];
  expanded: boolean;
  onExpandToggle: () => void;
  onOpenTask: () => void;
  onProgressChange: (p: number) => void;
  onMilestoneToggle: () => void;
  onDeleteDependency: (dep: Dependency) => void;
  onDateChange: (field: "start" | "end", date: string | null) => void;
  members: NonNullable<ReturnType<typeof authClient.useActiveOrganization>["data"]>["members"];
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
          {outgoingDeps.length > 0 ? (
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

        {/* Title */}
        <span className="min-w-0 flex-1 truncate font-medium" title={task.title}>
          {task.title}
        </span>

        {/* Assignee avatar */}
        {assignee ? (
          <Avatar className="ml-1 size-5 shrink-0">
            <AvatarFallback className="text-[9px]">{assignee.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="ml-1 size-5 shrink-0" />
        )}

        {/* Start date */}
        <input
          type="date"
          className="w-[88px] shrink-0 rounded border-0 bg-transparent px-1 text-xs text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          value={task.startDate ?? ""}
          onClick={stopProp}
          onChange={(e) => {
            stopProp(e as unknown as React.MouseEvent);
            onDateChange("start", e.target.value || null);
          }}
        />

        {/* End date */}
        <input
          type="date"
          className="w-[88px] shrink-0 rounded border-0 bg-transparent px-1 text-xs text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          value={task.endDate ?? ""}
          onClick={stopProp}
          onChange={(e) => {
            stopProp(e as unknown as React.MouseEvent);
            onDateChange("end", e.target.value || null);
          }}
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

      {/* Dependency expansion row */}
      {expanded && outgoingDeps.length > 0 && (
        <div className="border-b bg-muted/20 px-6 py-1.5">
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">Dependencies</p>
          <div className="space-y-0.5">
            {outgoingDeps.map((dep) => {
              const target = allTasks.find((t) => t.id === dep.toTaskId);
              return (
                <div key={dep.id} className="flex items-center gap-2 text-xs text-muted-foreground">
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
  const { data: activeOrg } = authClient.useActiveOrganization();
  const members = activeOrg?.members ?? [];

  const outgoingDepsByTask = new Map<string, Dependency[]>();
  for (const dep of allDeps) {
    if (!outgoingDepsByTask.has(dep.fromTaskId)) outgoingDepsByTask.set(dep.fromTaskId, []);
    outgoingDepsByTask.get(dep.fromTaskId)!.push(dep);
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
        <span className="w-[88px] shrink-0 text-center">Start</span>
        <span className="w-[88px] shrink-0 text-center">End</span>
        <span className="w-10 shrink-0 text-center">%</span>
      </div>

      {/* Scrollable task rows — ref forwarded for synchronized scroll */}
      <div ref={leftScrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
        {scheduled.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            outgoingDeps={outgoingDepsByTask.get(task.id) ?? []}
            allTasks={tasks}
            expanded={expandedTaskId === task.id}
            onExpandToggle={() => onExpandToggle(task.id)}
            onOpenTask={() => onOpenTask(task)}
            onProgressChange={(p) => onProgressChange(task, p)}
            onMilestoneToggle={() => onMilestoneToggle(task)}
            onDeleteDependency={onDeleteDependency}
            onDateChange={(field, date) => onDateChange(task, field, date)}
            members={members}
            linkMode={linkMode}
            isLinkSource={linkSourceId === task.id}
          />
        ))}

        {/* Unscheduled tasks section */}
        {unscheduled.length > 0 && (
          <>
            <div className="border-b bg-muted/20 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              Unscheduled ({unscheduled.length})
            </div>
            {unscheduled.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                outgoingDeps={outgoingDepsByTask.get(task.id) ?? []}
                allTasks={tasks}
                expanded={expandedTaskId === task.id}
                onExpandToggle={() => onExpandToggle(task.id)}
                onOpenTask={() => onOpenTask(task)}
                onProgressChange={(p) => onProgressChange(task, p)}
                onMilestoneToggle={() => onMilestoneToggle(task)}
                onDeleteDependency={onDeleteDependency}
                onDateChange={(field, date) => onDateChange(task, field, date)}
                members={members}
                linkMode={linkMode}
                isLinkSource={linkSourceId === task.id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
