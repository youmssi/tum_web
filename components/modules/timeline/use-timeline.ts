import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type Dependency,
  type DependencyType,
  type ScheduleResult,
  dependencyApi,
} from "./dependency-api";

export const DEP_KEYS = {
  forTask: (taskId: string) => ["dependencies", "task", taskId] as const,
  forProject: (projectId: string) => ["dependencies", "project", projectId] as const,
};

export const TASK_KEYS = {
  forProject: (projectId: string) => ["tasks", projectId] as const,
};

export function useDependencies(taskId: string | undefined) {
  return useQuery({
    queryKey: DEP_KEYS.forTask(taskId ?? ""),
    queryFn: () => dependencyApi.listForTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromTaskId,
      toTaskId,
      type,
      lagDays,
    }: {
      fromTaskId: string;
      toTaskId: string;
      type: DependencyType;
      lagDays?: number;
    }) => dependencyApi.create(fromTaskId, { toTaskId, type, lagDays }),
    onSuccess: (_, { fromTaskId, toTaskId }) => {
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(fromTaskId) });
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(toTaskId) });
      qc.invalidateQueries({ queryKey: ["dependencies", "project"] });
    },
  });
}

export function useDeleteDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; fromTaskId: string; toTaskId: string }) =>
      dependencyApi.remove(id),
    onSuccess: (_, { fromTaskId, toTaskId }) => {
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(fromTaskId) });
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(toTaskId) });
      qc.invalidateQueries({ queryKey: ["dependencies", "project"] });
    },
  });
}

export function useAutoSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => dependencyApi.autoSchedule(projectId),
    onSuccess: (result: ScheduleResult) => {
      if (result.updatedTasks.length > 0 || result.autoShiftedTasks.length > 0) {
        qc.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });
}

export type { Dependency, DependencyType, ScheduleResult };
