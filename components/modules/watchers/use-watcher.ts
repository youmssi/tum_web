"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { watcherApi } from "./watcher-api";

export const WATCHER_KEYS = {
  watching: (taskId: string) => ["watchers", taskId, "watching"] as const,
  list: (taskId: string) => ["watchers", taskId, "list"] as const,
};

export function useIsWatching(taskId: string) {
  return useQuery({
    queryKey: WATCHER_KEYS.watching(taskId),
    queryFn: () => watcherApi.watching(taskId),
  });
}

export function useToggleWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string }) => watcherApi.toggle(taskId),
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: WATCHER_KEYS.watching(taskId) });
      const previous = queryClient.getQueryData<{ watching: boolean }>(
        WATCHER_KEYS.watching(taskId),
      );
      // Optimistically toggle the watching state
      if (previous) {
        queryClient.setQueryData(WATCHER_KEYS.watching(taskId), {
          watching: !previous.watching,
        });
      }
      return { previous };
    },
    onError: (_err, { taskId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WATCHER_KEYS.watching(taskId), context.previous);
      }
    },
    onSettled: (_data, _err, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: WATCHER_KEYS.watching(taskId) });
      queryClient.invalidateQueries({ queryKey: WATCHER_KEYS.list(taskId) });
    },
  });
}
