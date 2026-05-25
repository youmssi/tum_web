"use client";

import { PlusIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type Task, type TaskStatus } from "@/components/modules/tasks";
import { TaskCard } from "./task-card";

const COLUMN_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-500",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  DONE: "bg-green-500",
};

const COLUMN_BG: Record<TaskStatus, string> = {
  TODO: "bg-slate-50 dark:bg-slate-950/40",
  IN_PROGRESS: "bg-blue-50 dark:bg-blue-950/20",
  IN_REVIEW: "bg-yellow-50 dark:bg-yellow-950/20",
  DONE: "bg-green-50 dark:bg-green-950/20",
};

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function BoardColumn({ status, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-64 max-w-xs flex-1 flex-col gap-0 rounded-xl border bg-card shadow-sm">
      {/* Column header */}
      <div className="flex items-center gap-2 rounded-t-xl border-b px-3 py-2.5">
        <span className={`size-2 rounded-full ${COLUMN_COLORS[status]}`} />
        <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
        <Badge variant="secondary" className="ml-auto px-1.5 py-0.5 text-xs font-medium">
          {tasks.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-2 rounded-b-xl p-2 transition-colors ${
          isOver ? `${COLUMN_BG[status]} ring-2 ring-inset ring-primary/30` : COLUMN_BG[status]
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
