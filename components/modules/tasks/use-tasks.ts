import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type CreateTaskPayload, type UpdateTaskPayload, taskApi } from "./task-api";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  detail: (id: string) => ["tasks", id] as const,
};

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
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      taskApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(TASK_KEYS.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(updated.projectId) });
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
