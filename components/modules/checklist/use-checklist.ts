"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { checklistApi, type ChecklistItem, type ChecklistProgress } from "./checklist-api";

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
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
      const previous = qc.getQueryData<ChecklistItem[]>(CHECKLIST_KEYS.items(taskId));
      if (previous) {
        const optimistic: ChecklistItem = {
          id: `optimistic-${Date.now()}`,
          taskId,
          text,
          checked: false,
          sortOrder: previous.length * 65536,
        };
        qc.setQueryData(CHECKLIST_KEYS.items(taskId), [...previous, optimistic]);
        // Update progress optimistically
        const prevProgress = qc.getQueryData<ChecklistProgress>(CHECKLIST_KEYS.progress(taskId));
        if (prevProgress) {
          qc.setQueryData(CHECKLIST_KEYS.progress(taskId), {
            ...prevProgress,
            total: prevProgress.total + 1,
          });
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(CHECKLIST_KEYS.items(taskId), context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async ({ itemId, data }) => {
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
      const previous = qc.getQueryData<ChecklistItem[]>(CHECKLIST_KEYS.items(taskId));
      if (previous) {
        qc.setQueryData(
          CHECKLIST_KEYS.items(taskId),
          previous.map((item) =>
            item.id === itemId ? { ...item, ...data } : item,
          ),
        );
        // Recalculate progress optimistically
        if (data.checked !== undefined) {
          const checkedDelta = data.checked ? 1 : -1;
          const prevProgress = qc.getQueryData<ChecklistProgress>(CHECKLIST_KEYS.progress(taskId));
          if (prevProgress) {
            qc.setQueryData(CHECKLIST_KEYS.progress(taskId), {
              ...prevProgress,
              checked: prevProgress.checked + checkedDelta,
            });
          }
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(CHECKLIST_KEYS.items(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistApi.remove(itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      await qc.cancelQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
      const previous = qc.getQueryData<ChecklistItem[]>(CHECKLIST_KEYS.items(taskId));
      if (previous) {
        const deletedItem = previous.find((i) => i.id === itemId);
        qc.setQueryData(
          CHECKLIST_KEYS.items(taskId),
          previous.filter((i) => i.id !== itemId),
        );
        // Update progress optimistically
        if (deletedItem) {
          const prevProgress = qc.getQueryData<ChecklistProgress>(CHECKLIST_KEYS.progress(taskId));
          if (prevProgress) {
            qc.setQueryData(CHECKLIST_KEYS.progress(taskId), {
              checked: deletedItem.checked
                ? prevProgress.checked - 1
                : prevProgress.checked,
              total: prevProgress.total - 1,
            });
          }
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(CHECKLIST_KEYS.items(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.items(taskId) });
      qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.progress(taskId) });
    },
  });
}
