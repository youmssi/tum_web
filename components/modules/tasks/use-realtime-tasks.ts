"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useStompSubscription } from "@/lib/use-stomp-subscription";
import { TASK_KEYS } from "./use-tasks";
import { ACTIVITY_KEYS } from "@/components/modules/activity";

export function useRealtimeTasks(projectId: string, orgId: string | null) {
  const queryClient = useQueryClient();

  useStompSubscription(
    orgId ? `/topic/org/${orgId}/projects/${projectId}/tasks` : null,
    () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.forProject(projectId) });
    },
  );
}
