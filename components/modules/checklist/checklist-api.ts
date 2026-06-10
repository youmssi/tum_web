import { api } from "@/lib/api-client";

export interface ChecklistItem {
  id: string;
  taskId: string;
  text: string;
  checked: boolean;
  sortOrder: number;
}

export interface ChecklistProgress {
  checked: number;
  total: number;
}

export const checklistApi = {
  list: (taskId: string) => api.get(`api/tasks/${taskId}/checklist`).json<ChecklistItem[]>(),

  create: (taskId: string, text: string) =>
    api.post(`api/tasks/${taskId}/checklist`, { json: { text } }).json<ChecklistItem>(),

  update: (itemId: string, data: { text?: string; checked?: boolean }) =>
    api.patch(`api/checklist/${itemId}`, { json: data }).json<ChecklistItem>(),

  remove: async (itemId: string) => {
    await api.delete(`api/checklist/${itemId}`);
  },

  progress: (taskId: string) =>
    api.get(`api/tasks/${taskId}/checklist/progress`).json<ChecklistProgress>(),
};
