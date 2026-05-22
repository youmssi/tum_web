import { useQuery } from "@tanstack/react-query";

import { activityApi } from "./activity-api";

export const ACTIVITY_KEYS = {
  forProject: (projectId: string) => ["activity", "project", projectId] as const,
};

export function useActivity(projectId: string) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.forProject(projectId),
    queryFn: () => activityApi.listForProject(projectId),
    enabled: !!projectId,
  });
}
