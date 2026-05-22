import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type Dependency, type DependencyType, dependencyApi } from "./dependency-api";

export const DEP_KEYS = {
  forTask: (taskId: string) => ["dependencies", "task", taskId] as const,
  forProject: (projectId: string) => ["dependencies", "project", projectId] as const,
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
    }: {
      fromTaskId: string;
      toTaskId: string;
      type: DependencyType;
    }) => dependencyApi.create(fromTaskId, { toTaskId, type }),
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
    mutationFn: ({
      id,
    }: {
      id: string;
      fromTaskId: string;
      toTaskId: string;
    }) => dependencyApi.remove(id),
    onSuccess: (_, { fromTaskId, toTaskId }) => {
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(fromTaskId) });
      qc.invalidateQueries({ queryKey: DEP_KEYS.forTask(toTaskId) });
      qc.invalidateQueries({ queryKey: ["dependencies", "project"] });
    },
  });
}

export type { Dependency, DependencyType };
