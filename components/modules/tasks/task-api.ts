import { api } from "@/lib/api-client";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  labels: string[];
  orderIndex: number;
  progress: number;
  milestone: boolean;
  parentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskPayload {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labels?: string[] | null;
  orderIndex?: number | null;
  progress?: number | null;
  milestone?: boolean | null;
  /**
   * Parent task envelope — mirrors the backend wrapper so callers can distinguish
   * "leave alone" (omit the field) from "clear it" (`{ value: null }`). To set a new parent
   * send `{ value: "<task-id>" }`.
   */
  parentTaskId?: { value: string | null };
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export type BulkAction = "UPDATE" | "DELETE";

export interface BulkTaskPayload {
  ids: string[];
  action: BulkAction;
  status?: TaskStatus;
  assigneeId?: string;
}

export const taskApi = {
  listForProject: (projectId: string) => api.get(`api/projects/${projectId}/tasks`).json<Task[]>(),

  get: (id: string) => api.get(`api/tasks/${id}`).json<Task>(),

  search: async (q: string): Promise<Task[]> => {
    const data = await api.get("api/tasks", { searchParams: { q } }).json<{ content: Task[] }>();
    return data.content;
  },

  searchWithFilters: async ({
    statuses,
    priorities,
    assigneeIds,
    labels,
    dueFrom,
    dueTo,
    q,
    projectId,
  }: {
    statuses?: string[];
    priorities?: string[];
    assigneeIds?: string[];
    labels?: string[];
    dueFrom?: string;
    dueTo?: string;
    q?: string;
    projectId?: string;
  }): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (statuses?.length) params.status = statuses[0];
    if (priorities?.length) params.priority = priorities[0];
    if (assigneeIds?.length) {
      // "me" resolves server-side; otherwise use first member id
      params.assignee = assigneeIds.includes("__me__") ? "me" : assigneeIds[0];
    }
    if (labels?.length) params.label = labels[0];
    if (dueFrom) params.dueFrom = dueFrom;
    if (dueTo) params.dueTo = dueTo;
    if (projectId) params.projectId = projectId;
    if (q) params.q = q;
    const data = await api.get("api/tasks", { searchParams: params }).json<{ content: Task[] }>();
    return data.content;
  },

  create: (projectId: string, data: CreateTaskPayload) =>
    api.post(`api/projects/${projectId}/tasks`, { json: data }).json<Task>(),

  update: (id: string, data: UpdateTaskPayload) =>
    api.patch(`api/tasks/${id}`, { json: data }).json<Task>(),

  move: (id: string, data: { status: TaskStatus; afterTaskId?: string }) =>
    api.patch(`api/tasks/${id}/move`, { json: data }).json<Task>(),

  reschedule: (id: string, data: { startDate?: string | null; endDate?: string | null }) =>
    api.patch(`api/tasks/${id}/schedule`, { json: data }).json<Task>(),

  bulk: async (data: BulkTaskPayload): Promise<void> => {
    await api.patch("api/tasks/bulk", { json: data });
  },

  myWork: async (): Promise<Task[]> => {
    const data = await api
      .get("api/tasks", { searchParams: { assignee: "me" } })
      .json<{ content: Task[] }>();
    return data.content;
  },

  remove: async (id: string) => {
    await api.delete(`api/tasks/${id}`);
  },
};
