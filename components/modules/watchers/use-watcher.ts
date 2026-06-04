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
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: WATCHER_KEYS.watching(taskId) });
      queryClient.invalidateQueries({ queryKey: WATCHER_KEYS.list(taskId) });
    },
  });
}
