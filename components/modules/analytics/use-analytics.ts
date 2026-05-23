import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "./analytics-api";

export const ANALYTICS_KEYS = {
  project: (projectId: string) => ["analytics", "project", projectId] as const,
};

export function useProjectMetrics(projectId: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.project(projectId),
    queryFn: () => analyticsApi.project(projectId),
    enabled: !!projectId,
  });
}
