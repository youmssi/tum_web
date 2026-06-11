"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Task } from "./task-api";
import {
  useCreateDependency,
  useDeleteDependency,
  useDependencies,
} from "@/components/modules/timeline";
import { DEPENDENCY_TYPE_LABELS } from "@/components/modules/timeline/dependency-api";

interface TaskDetailDependenciesProps {
  task: Task;
  allTasks: Task[];
}

export function TaskDetailDependencies({ task, allTasks }: TaskDetailDependenciesProps) {
  const { data: deps } = useDependencies(task.id);
  const createDep = useCreateDependency();
  const deleteDep = useDeleteDependency();
  const [newPredecessorId, setNewPredecessorId] = useState("");

  const predecessors = (deps ?? []).filter((d) => d.toTaskId === task.id);
  const predecessorIds = new Set(predecessors.map((d) => d.fromTaskId));
  const available = (allTasks ?? []).filter((t) => t.id !== task.id && !predecessorIds.has(t.id));

  async function handleAddDep() {
    if (!newPredecessorId) return;
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
                <span className="text-sm line-clamp-1">{pred?.title ?? dep.fromTaskId}</span>
                <span className="text-xs text-muted-foreground">
                  {DEPENDENCY_TYPE_LABELS[dep.type]}
                  {dep.lagDays > 0 ? ` +${dep.lagDays}d` : ""}
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
        <div className="flex gap-2 items-end">
          <Field className="flex-1">
            <FieldLabel>Add dependency</FieldLabel>
            <Select value={newPredecessorId} onValueChange={setNewPredecessorId}>
              <SelectTrigger className="text-sm">
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
          </Field>
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
}
