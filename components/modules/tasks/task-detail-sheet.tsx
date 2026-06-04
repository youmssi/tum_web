"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDirectory } from "@/components/modules/organization";
import { useStatusName } from "@/components/modules/projects";
import { CommentThread } from "@/components/modules/comments";
import { AttachmentList, FileUpload } from "@/components/modules/files";
import { ChecklistView } from "@/components/modules/checklist";
import { CustomFieldValues } from "@/components/modules/custom-fields";
import { WatchToggle } from "@/components/modules/watchers";
import {
  useCreateDependency,
  useDeleteDependency,
  useDependencies,
} from "@/components/modules/timeline";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./task-api";
import {
  useCreateTask,
  useDeleteTask,
  useRescheduleTask,
  useUpdateTask,
  useTasks,
} from "./use-tasks";

const schema = z.object({
  title: z.string().min(1, "Title is required.").max(300),
  description: z.string().max(10000).nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().nullable(),
  parentTaskId: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  labels: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

/**
 * BFS down the parent-child tree to find every task that has {@code rootId} somewhere in its
 * ancestor chain. Used to filter the parent-task dropdown so users can't introduce a cycle
 * client-side (the backend also blocks cycles defensively).
 */
function descendantIds(rootId: string, all: Task[]): Set<string> {
  const out = new Set<string>();
  const queue: string[] = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const candidate of all) {
      if (candidate.parentTaskId === id && !out.has(candidate.id)) {
        out.add(candidate.id);
        queue.push(candidate.id);
      }
    }
  }
  return out;
}

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function TaskDetailSheet({ task, open, onOpenChange, projectId }: TaskDetailSheetProps) {
  const updateTask = useUpdateTask();
  const createTask = useCreateTask(projectId);
  const rescheduleTask = useRescheduleTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const { data: directory } = useDirectory();
  const members = directory ?? [];
  // Use the project-configured status names — the detail sheet's Status select must show
  // "Backlog" / "Shipped" / whatever the owner has renamed the columns to.
  const resolveStatusName = useStatusName(projectId);
  const { data: allTasks } = useTasks(projectId);
  const { data: deps } = useDependencies(task?.id);
  const createDep = useCreateDependency();
  const deleteDep = useDeleteDependency();
  const [newPredecessorId, setNewPredecessorId] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
      parentTaskId: null,
      startDate: null,
      endDate: null,
      dueDate: null,
      labels: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId ?? null,
        parentTaskId: task.parentTaskId ?? null,
        startDate: task.startDate ?? null,
        endDate: task.endDate ?? null,
        dueDate: task.dueDate ?? null,
        labels: task.labels ?? [],
      });
    }
  }, [task, form]);

  async function save(values: FormValues) {
    if (!task) return;
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: {
          title: values.title,
          description: values.description || null,
          status: values.status as TaskStatus,
          priority: values.priority as TaskPriority,
          assigneeId: values.assigneeId || null,
          dueDate: values.dueDate || null,
          labels: values.labels,
          orderIndex: task.orderIndex,
          // Always send the parent envelope so the backend distinguishes "leave alone" (absent)
          // from "clear" (envelope present, value null) — same wrapper semantics as the WIP limit.
          parentTaskId: { value: values.parentTaskId || null },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save task.";
      toast.error(message);
    }
  }

  async function handleReschedule() {
    if (!task) return;
    const { startDate, endDate } = form.getValues();
    try {
      await rescheduleTask.mutateAsync({
        id: task.id,
        startDate: startDate || null,
        endDate: endDate || null,
      });
    } catch {
      toast.error("Failed to save schedule.");
    }
  }

  async function handleDelete() {
    if (!task) return;
    // Snapshot before delete so undo can restore the visible fields. Best-effort: comments,
    // attachments, and dependencies aren't part of the snapshot — the restored task is a fresh
    // row with a new id. Six-second window matches the toast duration.
    const snapshot = task;
    try {
      await deleteTask.mutateAsync(task.id);
      onOpenChange(false);
      toast.success("Task deleted.", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const recreated = await createTask.mutateAsync({
                title: snapshot.title,
                description: snapshot.description ?? undefined,
                priority: snapshot.priority,
                assigneeId: snapshot.assigneeId ?? undefined,
                dueDate: snapshot.dueDate ?? undefined,
                labels: snapshot.labels,
              });
              await updateTask.mutateAsync({
                id: recreated.id,
                data: {
                  title: recreated.title,
                  description: snapshot.description ?? null,
                  status: snapshot.status,
                  priority: snapshot.priority,
                  assigneeId: snapshot.assigneeId,
                  dueDate: snapshot.dueDate,
                  labels: snapshot.labels,
                  progress: snapshot.progress,
                  milestone: snapshot.milestone,
                },
              });
              // Schedule (start/end) goes through the dedicated endpoint; only restore if set.
              if (snapshot.startDate || snapshot.endDate) {
                await rescheduleTask.mutateAsync({
                  id: recreated.id,
                  startDate: snapshot.startDate,
                  endDate: snapshot.endDate,
                });
              }
              toast.success("Task restored.");
            } catch {
              toast.error("Failed to restore task.");
            }
          },
        },
        duration: 6000,
      });
    } catch {
      toast.error("Failed to delete task.");
    }
  }

  const labelInputRef = useRef<HTMLInputElement>(null);
  const labels = useWatch({ control: form.control, name: "labels", defaultValue: [] });

  function addLabel(value: string) {
    const trimmed = value.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    form.setValue("labels", [...labels, trimmed]);
  }

  function removeLabel(label: string) {
    form.setValue(
      "labels",
      labels.filter((l) => l !== label),
    );
  }

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Task detail</SheetTitle>
            <WatchToggle taskId={task.id} />
          </div>
        </SheetHeader>

        <form noValidate className="space-y-5">
          <FieldGroup className="gap-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="detail-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="detail-title"
                    onBlur={() => {
                      field.onBlur();
                      form.handleSubmit(save)();
                    }}
                  />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.handleSubmit(save)();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {resolveStatusName(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Priority</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.handleSubmit(save)();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="assigneeId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Assignee</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => {
                      field.onChange(v === "__none__" ? null : v);
                      form.handleSubmit(save)();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="parentTaskId"
              control={form.control}
              render={({ field }) => {
                // Exclude self + any descendant so the user can't introduce a cycle from the UI
                // (the backend re-checks the cycle on save, this just hides invalid choices).
                const descendants = descendantIds(task.id, allTasks ?? []);
                const candidates = (allTasks ?? []).filter(
                  (t) => t.id !== task.id && !descendants.has(t.id),
                );
                return (
                  <Field>
                    <FieldLabel>Parent task</FieldLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => {
                        field.onChange(v === "__none__" ? null : v);
                        form.handleSubmit(save)();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Top-level task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Top-level task</SelectItem>
                        {candidates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Make this a subtask of another task in the same project.
                    </p>
                  </Field>
                );
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="startDate"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="detail-start-date">Start date</FieldLabel>
                    <Input
                      {...field}
                      id="detail-start-date"
                      type="date"
                      value={field.value ?? ""}
                      onBlur={() => {
                        field.onBlur();
                        handleReschedule();
                      }}
                    />
                  </Field>
                )}
              />
              <Controller
                name="endDate"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="detail-end-date">End date</FieldLabel>
                    <Input
                      {...field}
                      id="detail-end-date"
                      type="date"
                      value={field.value ?? ""}
                      onBlur={() => {
                        field.onBlur();
                        handleReschedule();
                      }}
                    />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="detail-due-date">Due date</FieldLabel>
                  <Input
                    {...field}
                    id="detail-due-date"
                    type="date"
                    value={field.value ?? ""}
                    onBlur={() => {
                      field.onBlur();
                      form.handleSubmit(save)();
                    }}
                  />
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="detail-labels">Labels</FieldLabel>
              <div className="space-y-2">
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {labels.map((label) => (
                      <Badge key={label} variant="secondary" className="gap-1">
                        {label}
                        <button
                          type="button"
                          onClick={() => {
                            removeLabel(label);
                            form.handleSubmit(save)();
                          }}
                          className="hover:text-destructive"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  ref={labelInputRef}
                  id="detail-labels"
                  placeholder="Add label and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addLabel(e.currentTarget.value);
                      e.currentTarget.value = "";
                      form.handleSubmit(save)();
                    }
                  }}
                />
              </div>
            </Field>

            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="detail-description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="detail-description"
                    value={field.value ?? ""}
                    placeholder="Add a description…"
                    rows={5}
                    onBlur={() => {
                      field.onBlur();
                      form.handleSubmit(save)();
                    }}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Separator className="my-6" />

        <CustomFieldValues taskId={task.id} projectId={projectId} />

        <Separator className="my-6" />

        <ChecklistView taskId={task.id} />

        {task &&
          (() => {
            const predecessors = (deps ?? []).filter((d) => d.toTaskId === task.id);
            const predecessorIds = new Set(predecessors.map((d) => d.fromTaskId));
            const available = (allTasks ?? []).filter(
              (t) => t.id !== task.id && !predecessorIds.has(t.id),
            );

            async function handleAddDep() {
              if (!newPredecessorId || !task) return;
              try {
                await createDep.mutateAsync({
                  fromTaskId: newPredecessorId,
                  toTaskId: task.id,
                  type: "FINISH_TO_START",
                });
                setNewPredecessorId("");
              } catch {
                toast.error("Cannot add dependency — would create a cycle or already exists.");
              }
            }

            return (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium">Dependencies</p>
                {predecessors.length > 0 && (
                  <div className="space-y-1">
                    {predecessors.map((dep) => {
                      const pred = allTasks?.find((t) => t.id === dep.fromTaskId);
                      return (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                        >
                          <span className="text-sm line-clamp-1">
                            {pred?.title ?? dep.fromTaskId}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-6"
                            disabled={deleteDep.isPending}
                            onClick={() =>
                              deleteDep.mutate({
                                id: dep.id,
                                fromTaskId: dep.fromTaskId,
                                toTaskId: dep.toTaskId,
                              })
                            }
                          >
                            <XIcon className="size-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {available.length > 0 && (
                  <div className="flex gap-2">
                    <Select value={newPredecessorId} onValueChange={setNewPredecessorId}>
                      <SelectTrigger className="flex-1 text-sm">
                        <SelectValue placeholder="Depends on…" />
                      </SelectTrigger>
                      <SelectContent>
                        {available.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!newPredecessorId || createDep.isPending}
                      onClick={handleAddDep}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium">Attachments</p>
          <AttachmentList entityType="TASK" entityId={task.id} />
          <FileUpload entityType="TASK" entityId={task.id} />
        </div>

        <Separator className="my-6" />

        <CommentThread taskId={task.id} />

        <Separator className="my-6" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={deleteTask.isPending}>
              <Trash2Icon className="mr-2 size-4" />
              Delete task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task and all its comments. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
