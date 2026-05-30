"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { STATUS_LABELS, type TaskStatus } from "@/components/modules/tasks/task-api";
import {
  type ReorderStatusesPayload,
  type StatusCategory,
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

/**
 * Resolves a status category (the immutable enum the backend stores on every task) to the
 * project's currently-configured display name — "To do" by default, but "Backlog" or "Shipped"
 * after the user renames the column in Project Settings. Falls back to the hard-coded
 * {@link STATUS_LABELS} when the statuses query is still loading or hasn't been seeded.
 *
 * Use this everywhere a project-scoped view renders a status label. Cross-project surfaces
 * (My Work, the command palette, the audit log) can't pick a single project context and keep
 * using {@link STATUS_LABELS} — document the reason on each call site.
 */
export function useStatusName(projectId: string | undefined) {
  const { data: statuses } = useStatuses(projectId);
  return useCallback(
    (category: StatusCategory | TaskStatus): string => {
      const config = statuses?.find((s) => s.category === category);
      return config?.name ?? STATUS_LABELS[category as TaskStatus];
    },
    [statuses],
  );
}

/**
 * Resolves a status category to the configured hex color, falling back to a sensible default per
 * category. Companion to {@link useStatusName} — used by the dashboard donut + activity badges
 * so renaming a column propagates the colour everywhere too.
 */
export function useStatusColor(projectId: string | undefined) {
  const { data: statuses } = useStatuses(projectId);
  return useCallback(
    (category: StatusCategory | TaskStatus): string => {
      const config = statuses?.find((s) => s.category === category);
      return config?.color ?? DEFAULT_STATUS_COLOR[category as TaskStatus];
    },
    [statuses],
  );
}

const DEFAULT_STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#eab308",
  DONE: "#22c55e",
};
