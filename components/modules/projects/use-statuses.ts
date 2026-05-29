"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type ReorderStatusesPayload,
  type TaskStatusConfig,
  type UpdateStatusPayload,
  statusApi,
} from "./status-api";

export const STATUS_KEYS = {
  forProject: (projectId: string) => ["statuses", "project", projectId] as const,
};

/**
 * Loads the configured status columns for a project. The board, the list status filter, and the
 * detail-sheet dropdown all read from this hook so renaming a column propagates everywhere
 * without a refresh. Cached for 60 s; mutations invalidate eagerly.
 */
export function useStatuses(projectId: string | undefined) {
  return useQuery<TaskStatusConfig[]>({
    queryKey: STATUS_KEYS.forProject(projectId ?? ""),
    queryFn: () => statusApi.listForProject(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useUpdateStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      statusApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STATUS_KEYS.forProject(projectId) });
    },
  });
}

export function useReorderStatuses(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderStatusesPayload) => statusApi.reorder(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STATUS_KEYS.forProject(projectId) });
    },
  });
}
