import { api } from "@/lib/api-client";

export interface TaskWatcher {
  id: string;
  taskId: string;
  userId: string;
  createdAt: string;
}

export const watcherApi = {
  list: (taskId: string) => api.get(`api/tasks/${taskId}/watchers`).json<TaskWatcher[]>(),

  toggle: (taskId: string) => api.post(`api/tasks/${taskId}/watch`).json<{ watching: boolean }>(),

  unwatch: (taskId: string) =>
    api.delete(`api/tasks/${taskId}/watch`).json<{ watching: boolean }>(),

  watching: (taskId: string) =>
    api.get(`api/tasks/${taskId}/watching`).json<{ watching: boolean }>(),
};
