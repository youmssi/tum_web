import { api } from "@/lib/api-client";
import type { TaskPriority, TaskStatus } from "../tasks/task-api";

/**
 * The filter configuration stored per saved filter.
 * Mirrors the backend SavedFilterConfig record.
 */
export interface SavedFilterConfig {
  statuses?: TaskStatus[];
  priorities?: TaskPriority[];
  assigneeIds?: string[];
  labels?: string[];
  dueFrom?: string;
  dueTo?: string;
  q?: string;
  customFields?: Record<string, unknown>;
}

export interface SavedFilter {
  id: string;
  userId: string;
  projectId: string | null;
  name: string;
  config: SavedFilterConfig;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedFilterPayload {
  name: string;
  config: SavedFilterConfig;
}

export interface UpdateSavedFilterPayload {
  name?: string;
  config?: SavedFilterConfig;
}

export const savedFilterApi = {
  list: (projectId?: string) => {
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    return api
      .get("api/saved-filters", { searchParams: params })
      .json<SavedFilter[]>();
  },

  create: (data: CreateSavedFilterPayload, projectId?: string) => {
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    return api
      .post("api/saved-filters", { searchParams: params, json: data })
      .json<SavedFilter>();
  },

  update: (id: string, data: UpdateSavedFilterPayload) =>
    api.patch(`api/saved-filters/${id}`, { json: data }).json<SavedFilter>(),

  remove: async (id: string) => {
    await api.delete(`api/saved-filters/${id}`);
  },

  setDefault: (id: string) =>
    api.patch(`api/saved-filters/${id}/default`).json<SavedFilter>(),

  unsetDefault: async (id: string) => {
    await api.delete(`api/saved-filters/${id}/default`);
  },
};
