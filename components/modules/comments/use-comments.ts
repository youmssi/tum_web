import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { commentApi } from "./comment-api";

export const COMMENT_KEYS = {
  forTask: (taskId: string) => ["comments", "task", taskId] as const,
};

export function useComments(taskId: string | undefined) {
  return useQuery({
    queryKey: COMMENT_KEYS.forTask(taskId ?? ""),
    queryFn: () => commentApi.listForTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, mentionedUserIds }: { content: string; mentionedUserIds?: string[] }) =>
      commentApi.create(taskId, content, mentionedUserIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentApi.update(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}
