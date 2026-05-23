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

interface ProjectDashboardResponse {
  totalTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  completionPct: number;
}

export const analyticsApi = {
  project: async (projectId: string): Promise<ProjectMetrics> => {
    const data = await api
      .get(`api/projects/${projectId}/dashboard`)
      .json<ProjectDashboardResponse>();
    return {
      totalTasks: data.totalTasks,
      completedTasks: data.byStatus?.DONE ?? 0,
      overdueTasks: data.overdueCount,
      completionTrend: [],
    };
  },
};
