import { api } from "@/lib/api-client";

export type ActivityAction =
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_ASSIGNED"
  | "COMMENT_ADDED";

export interface Activity {
  id: string;
  projectId: string;
  actorId: string;
  action: ActivityAction;
  targetId: string;
  detail: string | null;
  createdAt: string;
}

export const activityApi = {
  listForProject: (projectId: string) =>
    api.get(`api/projects/${projectId}/activity`).json<Activity[]>(),
};
