import { api } from "@/lib/api-client";

export interface Comment {
  id: string;
  taskId: string;
  organizationId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const commentApi = {
  listForTask: (taskId: string) => api.get(`api/tasks/${taskId}/comments`).json<Comment[]>(),

  create: (taskId: string, content: string, mentionedUserIds?: string[]) =>
    api
      .post(`api/tasks/${taskId}/comments`, { json: { content, mentionedUserIds } })
      .json<Comment>(),

  update: (id: string, content: string) =>
    api.patch(`api/comments/${id}`, { json: { content } }).json<Comment>(),

  remove: async (id: string) => {
    await api.delete(`api/comments/${id}`);
  },
};
