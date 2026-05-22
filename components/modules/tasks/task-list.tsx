"use client";

import { CircleIcon, LayoutListIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./task-api";
import { TaskDetailSheet } from "./task-detail-sheet";
import { CreateTaskDialog } from "./create-task-dialog";
import { useTasks } from "./use-tasks";

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  IN_REVIEW: "text-yellow-500",
  DONE: "text-green-500",
};

const PRIORITY_VARIANTS: Record<
  TaskPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "default",
  URGENT: "destructive",
};

function MemberName({ userId }: { userId: string | null }) {
  const { data: activeOrg } = authClient.useActiveOrganization();
  if (!userId) return <span className="text-muted-foreground">—</span>;
  const member = activeOrg?.members?.find((m) => m.userId === userId);
  const name = member?.user?.name ?? member?.user?.email ?? userId;
  return <span>{name}</span>;
}

export function TaskList({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");

  const filtered = (tasks ?? []).filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  function openTask(task: Task) {
    setSelectedTask(task);
    setSheetOpen(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded-md px-2 py-1 bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            className="text-sm border rounded-md px-2 py-1 bg-background"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <CreateTaskDialog projectId={projectId} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <LayoutListIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {tasks?.length === 0 ? "No tasks yet. Create the first one." : "No tasks match the current filters."}
          </p>
          {tasks?.length === 0 && <CreateTaskDialog projectId={projectId} />}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-32 hidden sm:table-cell">Assignee</TableHead>
              <TableHead className="w-28 hidden md:table-cell">Due</TableHead>
              <TableHead className="hidden lg:table-cell">Labels</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer"
                onClick={() => openTask(task)}
              >
                <TableCell>
                  <CircleIcon
                    className={`size-4 ${STATUS_COLORS[task.status]}`}
                    aria-label={STATUS_LABELS[task.status]}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{STATUS_LABELS[task.status]}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-xs">
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  <MemberName userId={task.assigneeId} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
