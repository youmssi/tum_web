import { api } from "@/lib/api-client";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_MENTIONED"
  | "COMMENT_ADDED"
  | "TASK_STATUS_CHANGED";

export interface Notification {
  id: string;
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  targetId: string;
  projectId: string;
  createdAt: string;
}

export interface NotificationPreference {
  type: NotificationType;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

export const notificationApi = {
  list: () => api.get("api/notifications").json<Notification[]>(),

  markRead: (id: string) =>
    api.patch(`api/notifications/${id}/read`).json<Notification>(),

  markAllRead: async () => {
    await api.patch("api/notifications/read-all");
  },

  listPreferences: () =>
    api.get("api/notifications/preferences").json<NotificationPreference[]>(),

  updatePreference: (
    type: NotificationType,
    data: { emailEnabled?: boolean; inAppEnabled?: boolean },
  ) =>
    api
      .patch(`api/notifications/preferences/${type}`, { json: data })
      .json<NotificationPreference>(),
};
