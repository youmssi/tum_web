import { api } from "@/lib/api-client";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  archived: boolean;
  memberRestricted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  memberRestricted?: boolean;
}

export interface UpdateProjectPayload {
  name: string;
  description?: string | null;
  memberRestricted?: boolean;
}

export const projectApi = {
  list: (includeArchived = false) =>
    api.get("api/projects", { searchParams: { includeArchived } }).json<Project[]>(),

  get: (id: string) => api.get(`api/projects/${id}`).json<Project>(),

  create: (data: CreateProjectPayload) => api.post("api/projects", { json: data }).json<Project>(),

  update: (id: string, data: UpdateProjectPayload) =>
    api.patch(`api/projects/${id}`, { json: data }).json<Project>(),

  archive: (id: string) => api.post(`api/projects/${id}/archive`).json<Project>(),

  unarchive: (id: string) => api.post(`api/projects/${id}/unarchive`).json<Project>(),

  remove: async (id: string) => {
    await api.delete(`api/projects/${id}`);
  },
};
