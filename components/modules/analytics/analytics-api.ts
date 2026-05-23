import { api } from "@/lib/api-client";

export interface TrendPoint {
  date: string;
  completed: number;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionTrend: TrendPoint[];
}

export const analyticsApi = {
  project: (projectId: string) =>
    api.get(`api/analytics/projects/${projectId}`).json<ProjectMetrics>(),
};
