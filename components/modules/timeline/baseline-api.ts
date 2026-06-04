import { api } from "@/lib/api-client";

export interface BaselineTaskResponse {
  taskId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  durationDays: number;
}

export interface BaselineResponse {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  createdAt: string;
  tasks: BaselineTaskResponse[];
}

export interface TaskVariance {
  taskId: string;
  title: string;
  baselineStart: string | null;
  baselineEnd: string | null;
  currentStart: string | null;
  currentEnd: string | null;
  startVarianceDays: number | null;
  endVarianceDays: number | null;
}

export interface VarianceReport {
  baseline: BaselineResponse;
  variances: TaskVariance[];
  tasksOnSchedule: number;
  tasksAhead: number;
  tasksBehind: number;
}

export interface CreateBaselinePayload {
  name: string;
  description?: string | null;
}

export const baselineApi = {
  capture: (projectId: string, data: CreateBaselinePayload) =>
    api.post(`api/projects/${projectId}/baselines`, { json: data }).json<BaselineResponse>(),

  listForProject: (projectId: string) =>
    api.get(`api/projects/${projectId}/baselines`).json<BaselineResponse[]>(),

  get: (baselineId: string) => api.get(`api/baselines/${baselineId}`).json<BaselineResponse>(),

  variance: (baselineId: string) =>
    api.get(`api/baselines/${baselineId}/variance`).json<VarianceReport>(),
};
