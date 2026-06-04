"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { checklistApi, type ChecklistProgress } from "./checklist-api";

export const CHECKLIST_KEYS = {
  items: (taskId: string) => ["checklist", "items", taskId] as const,
  progress: (taskId: string) => ["checklist", "progress", taskId] as const,
};

export function useChecklistItems(taskId: string | undefined) {
  return useQuery({
    queryKey: CHECKLIST_KEYS.items(taskId ?? ""),
    queryFn: () => checklistApi.list(taskId!),
    enabled: !!taskId,
  });
}

export function useChecklistProgress(taskId: string | undefined) {
  return useQuery<ChecklistProgress>({
    queryKey: CHECKLIST_KEYS.progress(taskId ?? ""),
    queryFn: () => checklistApi.progress(taskId!),
    enabled: !!taskId,
    staleTime: 10_000,
  });
}

export function useCreateChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => checklistApi.create(taskId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
    },
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: { text?: string; checked?: boolean };
    }) => checklistApi.update(itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistApi.remove(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
    },
  });
}
