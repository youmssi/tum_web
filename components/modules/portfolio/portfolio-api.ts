import { api } from "@/lib/api-client";

export interface PortfolioProjectMetrics {
  projectId: string;
  name: string;
  totalTasks: number;
  byStatus: Record<string, number>;
  completionPct: number;
  overdueCount: number;
  archived: boolean;
}

export interface PortfolioResponse {
  totalProjects: number;
  totalTasks: number;
  totalOverdue: number;
  overallCompletionPct: number;
  projects: PortfolioProjectMetrics[];
}

export const portfolioApi = {
  get: () => api.get("api/portfolio").json<PortfolioResponse>(),
};
