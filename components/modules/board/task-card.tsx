"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRIORITY_LABELS, type Task, type TaskPriority } from "@/components/modules/tasks";

const PRIORITY_VARIANTS: Record<
  TaskPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "default",
  URGENT: "destructive",
};

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, isOverlay, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging && !isOverlay ? "opacity-40" : ""}>
      <Card
        className={`select-none ${
          isOverlay ? "ring-2 ring-ring shadow-lg rotate-1 cursor-grabbing" : "cursor-pointer hover:shadow-sm"
        }`}
        onClick={() => !isDragging && onClick?.(task)}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              aria-label="Drag to reorder"
            >
              <GripVerticalIcon className="size-4" />
            </button>
            <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1 pl-6">
            <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-xs">
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            {task.labels.slice(0, 2).map((l) => (
              <Badge key={l} variant="secondary" className="text-xs">
                {l}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
          {task.dueDate && (
            <p className="pl-6 text-xs text-muted-foreground">
              Due{" "}
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
