import { api } from "@/lib/api-client";

export interface WeekBucket {
  weekStart: string;
  taskCount: number;
  taskTitles: string[];
}

export interface AssigneeLoad {
  assigneeId: string;
  totalTasks: number;
  weekly: WeekBucket[];
  overallocated: boolean;
}

export interface WorkloadResponse {
  assignees: AssigneeLoad[];
  windowStart: string;
  windowEnd: string;
  capacityPerWeek: number;
}

export const workloadApi = {
  get: (projectId: string, capacityPerWeek = 5, windowWeeks = 8) =>
    api
      .get(`api/projects/${projectId}/workload`, {
        searchParams: { capacityPerWeek, windowWeeks },
      })
      .json<WorkloadResponse>(),
};
