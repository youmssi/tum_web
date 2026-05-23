"use client";

import { useMemo, useState } from "react";
import { AlertCircleIcon, CalendarIcon, CheckCircle2Icon, ListTodoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetailSheet } from "@/components/modules/tasks/task-detail-sheet";
import { type Task, type TaskStatus, STATUS_LABELS, PRIORITY_LABELS } from "@/components/modules/tasks/task-api";
import { useMyTasks } from "@/components/modules/tasks/use-tasks";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "destructive",
  URGENT: "destructive",
};

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`size-4 ${highlight && value > 0 ? "text-destructive" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${highlight && value > 0 ? "text-destructive" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium">{task.title}</p>
        {task.dueDate && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={PRIORITY_COLORS[task.priority] as "secondary" | "outline" | "destructive"} className="text-xs">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <Badge variant="outline" className="text-xs">{STATUS_LABELS[task.status]}</Badge>
      </div>
    </button>
  );
}

export function MyWorkDashboard() {
  const { data: tasks, isLoading } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    if (!tasks) return { total: 0, overdue: 0, dueToday: 0, done: 0 };
    return {
      total: tasks.length,
      overdue: tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "DONE").length,
      dueToday: tasks.filter((t) => t.dueDate === today).length,
      done: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [tasks, today]);

  const byStatus = useMemo<Record<string, Task[]>>(() => {
    if (!tasks) return {};
    return tasks.reduce<Record<string, Task[]>>((acc, t) => {
      (acc[t.status] ??= []).push(t);
      return acc;
    }, {});
  }, [tasks]);

  function openTask(task: Task) {
    setSelectedTask(task);
    setSheetOpen(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const statusOrder: TaskStatus[] = ["IN_PROGRESS", "IN_REVIEW", "TODO", "DONE"];

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={ListTodoIcon} label="Assigned to me" value={stats.total} />
          <StatCard icon={AlertCircleIcon} label="Overdue" value={stats.overdue} highlight />
          <StatCard icon={CheckCircle2Icon} label="Done" value={stats.done} />
        </div>

        {!tasks?.length ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
            <CheckCircle2Icon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No tasks assigned to you.</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue {stats.overdue > 0 && `(${stats.overdue})`}
              </TabsTrigger>
              <TabsTrigger value="today">Today {stats.dueToday > 0 && `(${stats.dueToday})`}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-6">
              {statusOrder.map((status) => {
                const group = byStatus[status];
                if (!group?.length) return null;
                return (
                  <div key={status} className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {STATUS_LABELS[status]} ({group.length})
                    </p>
                    {group.map((t) => <TaskRow key={t.id} task={t} onClick={() => openTask(t)} />)}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="overdue" className="mt-4 space-y-2">
              {(tasks ?? [])
                .filter((t) => t.dueDate && t.dueDate < today && t.status !== "DONE")
                .map((t) => <TaskRow key={t.id} task={t} onClick={() => openTask(t)} />)}
              {stats.overdue === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No overdue tasks.</p>
              )}
            </TabsContent>

            <TabsContent value="today" className="mt-4 space-y-2">
              {(tasks ?? [])
                .filter((t) => t.dueDate === today)
                .map((t) => <TaskRow key={t.id} task={t} onClick={() => openTask(t)} />)}
              {stats.dueToday === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Nothing due today.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          projectId={selectedTask.projectId}
        />
      )}
    </>
  );
}
