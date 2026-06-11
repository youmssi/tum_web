import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { commentApi, type Comment } from "./comment-api";

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
    onMutate: async ({ content }) => {
      await qc.cancelQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
      const previous = qc.getQueryData<Comment[]>(COMMENT_KEYS.forTask(taskId));
      if (previous) {
        const optimistic: Comment = {
          id: `optimistic-${Date.now()}`,
          taskId,
          organizationId: "",
          authorId: "",
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(COMMENT_KEYS.forTask(taskId), [...previous, optimistic]);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(COMMENT_KEYS.forTask(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentApi.update(id, content),
    onMutate: async ({ id, content }) => {
      await qc.cancelQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
      const previous = qc.getQueryData<Comment[]>(COMMENT_KEYS.forTask(taskId));
      if (previous) {
        qc.setQueryData(
          COMMENT_KEYS.forTask(taskId),
          previous.map((c) =>
            c.id === id ? { ...c, content, updatedAt: new Date().toISOString() } : c,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(COMMENT_KEYS.forTask(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
      const previous = qc.getQueryData<Comment[]>(COMMENT_KEYS.forTask(taskId));
      if (previous) {
        qc.setQueryData(
          COMMENT_KEYS.forTask(taskId),
          previous.filter((c) => c.id !== id),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(COMMENT_KEYS.forTask(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.forTask(taskId) });
    },
  });
}
