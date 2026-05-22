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

export const taskApi = {
  listForProject: (projectId: string) =>
    api.get(`api/projects/${projectId}/tasks`).json<Task[]>(),

  get: (id: string) => api.get(`api/tasks/${id}`).json<Task>(),

  create: (projectId: string, data: CreateTaskPayload) =>
    api.post(`api/projects/${projectId}/tasks`, { json: data }).json<Task>(),

  update: (id: string, data: UpdateTaskPayload) =>
    api.patch(`api/tasks/${id}`, { json: data }).json<Task>(),

  remove: async (id: string) => {
    await api.delete(`api/tasks/${id}`);
  },
};
