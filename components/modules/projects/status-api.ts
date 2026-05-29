import { api } from "@/lib/api-client";

/**
 * The status-config category enum matches the backend {@code TaskStatusCategory} and the legacy
 * {@code TaskStatus} enum 1:1. Renaming a column changes the display name but never the category —
 * analytics that rely on "DONE means completion" keep working.
 */
export type StatusCategory = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface TaskStatusConfig {
  id: string;
  projectId: string;
  category: StatusCategory;
  name: string;
  color: string;
  sortOrder: number;
  wipLimit: number | null;
}

export interface UpdateStatusPayload {
  name?: string;
  color?: string;
  // Present-but-null = clear the limit; absent = leave it unchanged.
  wipLimit?: { value: number | null };
}

export interface ReorderStatusesPayload {
  entries: { id: string; sortOrder: number }[];
}

export const statusApi = {
  listForProject: (projectId: string) =>
    api.get(`api/projects/${projectId}/statuses`).json<TaskStatusConfig[]>(),

  update: (statusId: string, body: UpdateStatusPayload) =>
    api.patch(`api/statuses/${statusId}`, { json: body }).json<TaskStatusConfig>(),

  reorder: (projectId: string, body: ReorderStatusesPayload) =>
    api
      .patch(`api/projects/${projectId}/statuses/reorder`, { json: body })
      .json<TaskStatusConfig[]>(),
};
