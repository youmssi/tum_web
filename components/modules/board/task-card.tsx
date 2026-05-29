"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarIcon, GripVerticalIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRIORITY_LABELS, type Task, type TaskPriority } from "@/components/modules/tasks";
import { useDirectory } from "@/components/modules/organization";

const PRIORITY_VARIANTS: Record<TaskPriority, "default" | "secondary" | "destructive" | "outline"> =
  {
    LOW: "secondary",
    MEDIUM: "outline",
    HIGH: "default",
    URGENT: "destructive",
  };

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-500",
};

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const diff = new Date(dueDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function isOverdue(dueDate: string | null, status: Task["status"]): boolean {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate).getTime() < Date.now();
}

function AssigneeAvatar({ userId }: { userId: string | null }) {
  const { data: directory } = useDirectory();
  if (!userId) {
    return (
      <div className="flex size-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
        <UserIcon className="size-3 text-muted-foreground/40" />
      </div>
    );
  }
  const member = directory?.find((m) => m.userId === userId);
  // Use the member's name when we have it; otherwise show a neutral "?" so the avatar never
  // displays the first two characters of a UUID-shaped user id.
  const initials = member ? member.name.slice(0, 2).toUpperCase() : "?";
  return (
    <Avatar className="size-5">
      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
    </Avatar>
  );
}

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

  const overdue = isOverdue(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate);

  return (
    <div ref={setNodeRef} style={style} className={isDragging && !isOverlay ? "opacity-40" : ""}>
      <Card
        className={`group select-none py-0 transition-shadow ${
          isOverlay
            ? "rotate-1 cursor-grabbing shadow-xl ring-2 ring-primary"
            : "cursor-pointer hover:shadow-md"
        }`}
        onClick={() => !isDragging && onClick?.(task)}
      >
        <CardContent className="p-0">
          {/* Priority bar */}
          <div
            className={`h-0.5 w-full rounded-t-[calc(var(--radius)-1px)] ${PRIORITY_DOT[task.priority]}`}
          />

          <div className="space-y-2 p-3">
            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.labels.slice(0, 3).map((l) => (
                  <Badge key={l} variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {l}
                  </Badge>
                ))}
                {task.labels.length > 3 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    +{task.labels.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Title + drag handle */}
            <div className="flex items-start gap-1.5">
              <button
                {...attributes}
                {...listeners}
                className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/0 transition-colors hover:text-muted-foreground group-hover:text-muted-foreground/60"
                onClick={(e) => e.stopPropagation()}
                aria-label="Drag to reorder"
              >
                <GripVerticalIcon className="size-3.5" />
              </button>
              <p className="flex-1 text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
            </div>

            {/* Footer: due date + priority + assignee */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={PRIORITY_VARIANTS[task.priority]}
                  className="px-1.5 py-0 text-[10px]"
                >
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                {task.dueDate && (
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-medium ${
                      overdue
                        ? "text-destructive"
                        : dueSoon
                          ? "text-orange-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="size-3" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <AssigneeAvatar userId={task.assigneeId} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
