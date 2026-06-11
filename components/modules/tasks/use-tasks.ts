import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type BulkTaskPayload,
  type CreateTaskPayload,
  type Task,
  type TaskStatus,
  type UpdateTaskPayload,
  taskApi,
} from "./task-api";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  myWork: ["tasks", "my-work"] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useMyTasks() {
  return useQuery({
    queryKey: TASK_KEYS.myWork,
    queryFn: taskApi.myWork,
  });
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: TASK_KEYS.byProject(projectId),
    queryFn: () => taskApi.listForProject(projectId),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => taskApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => taskApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(updated.projectId) });
    },
  });
}

export function useRescheduleTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      startDate,
      endDate,
    }: {
      id: string;
      startDate?: string | null;
      endDate?: string | null;
    }) => taskApi.reschedule(id, { startDate, endDate }),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useMoveTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      afterTaskId,
    }: {
      id: string;
      status: TaskStatus;
      afterTaskId?: string;
    }) => taskApi.move(id, { status, afterTaskId }),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useUpdateProgress(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ task, progress }: { task: Task; progress: number }) =>
      taskApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
        labels: task.labels,
        orderIndex: task.orderIndex,
        progress,
        milestone: task.milestone,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useToggleMilestone(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) =>
      taskApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
        labels: task.labels,
        orderIndex: task.orderIndex,
        progress: task.progress,
        milestone: !task.milestone,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
    },
  });
}

export function useBulkUpdateTasks(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkTaskPayload) => taskApi.bulk(data),
    onMutate: async (data: BulkTaskPayload) => {
      await qc.cancelQueries({ queryKey: TASK_KEYS.byProject(projectId) });
      const previous = qc.getQueryData<Task[]>(TASK_KEYS.byProject(projectId));
      if (previous) {
        const updated = previous
          .map((task) => {
            if (!data.ids.includes(task.id)) return task;
            if (data.action === "DELETE") return null;
            return {
              ...task,
              ...(data.status ? { status: data.status } : {}),
              ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
            };
          })
          .filter((t): t is Task => t !== null);
        qc.setQueryData(TASK_KEYS.byProject(projectId), updated);
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        qc.setQueryData(TASK_KEYS.byProject(projectId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}
