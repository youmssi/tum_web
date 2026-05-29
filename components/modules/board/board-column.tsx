"use client";

import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type TaskStatusConfig } from "@/components/modules/projects";
import { STATUS_LABELS, type Task, type TaskStatus } from "@/components/modules/tasks";
import { TaskCard } from "./task-card";

const CATEGORY_BG: Record<TaskStatus, string> = {
  TODO: "bg-slate-50 dark:bg-slate-950/40",
  IN_PROGRESS: "bg-blue-50 dark:bg-blue-950/20",
  IN_REVIEW: "bg-yellow-50 dark:bg-yellow-950/20",
  DONE: "bg-green-50 dark:bg-green-950/20",
};

interface BoardColumnProps {
  /** Drag-and-drop container id — always the {@code TaskStatus} enum, even after rename. */
  status: TaskStatus;
  /**
   * Configured status row for this column. Null while the project's statuses haven't loaded yet
   * (or for brand-new projects whose seed listener is still committing): we fall back to the
   * built-in labels and the column renders without a WIP / colour swatch.
   */
  config: TaskStatusConfig | null;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function BoardColumn({ status, config, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const title = config?.name ?? STATUS_LABELS[status];
  const accent = config?.color;
  const wipLimit = config?.wipLimit ?? null;
  const overLimit = wipLimit !== null && tasks.length > wipLimit;

  return (
    <div
      className={`flex min-w-64 max-w-xs flex-1 flex-col gap-0 rounded-xl border bg-card shadow-sm transition-colors ${
        overLimit ? "border-amber-400/60 dark:border-amber-500/40" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 rounded-t-xl border-b px-3 py-2.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: accent ?? "var(--muted-foreground)" }}
        />
        <span className="text-sm font-semibold">{title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Badge
            variant={overLimit ? "destructive" : "secondary"}
            className="px-1.5 py-0.5 text-xs font-medium"
          >
            {wipLimit !== null ? `${tasks.length} / ${wipLimit}` : tasks.length}
          </Badge>
          {overLimit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangleIcon className="size-3.5 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Over WIP limit ({tasks.length} of {wipLimit}). Move or finish tasks before pulling
                more in.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-2 rounded-b-xl p-2 transition-colors ${
          isOver ? `${CATEGORY_BG[status]} ring-2 ring-inset ring-primary/30` : CATEGORY_BG[status]
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {isOver && tasks.length === 0 && (
          <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-primary/30">
            <PlusIcon className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
