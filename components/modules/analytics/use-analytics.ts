"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AnalyticsResponse } from "./analytics-api";

interface ProjectDashboard {
  totalTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  completionPct: number;
  completionTrend: Array<{ date: string; completed: number }>;
}

const ANALYTICS_KEYS = {
  all: ["analytics"] as const,
  project: (projectId: string) => ["analytics", projectId] as const,
  dashboard: (projectId: string) => ["project-dashboard", projectId] as const,
};

export function useProjectMetrics(projectId: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.dashboard(projectId),
    queryFn: () => api.get(`api/projects/${projectId}/dashboard`).json<ProjectDashboard>(),
    staleTime: 30_000,
  });
}

export function useAnalytics(projectId: string, days = 30) {
  return useQuery({
    queryKey: [...ANALYTICS_KEYS.project(projectId), days],
    queryFn: async () => {
      const url = `api/projects/${projectId}/analytics?days=${days}`;
      return api.get(url).json<AnalyticsResponse>();
    },
    staleTime: 60_000,
  });
}
