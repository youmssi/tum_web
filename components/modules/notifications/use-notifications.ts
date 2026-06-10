import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type NotificationType, notificationApi } from "./notification-api";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  preferences: ["notifications", "preferences"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.all,
    queryFn: notificationApi.list,
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences,
    queryFn: notificationApi.listPreferences,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: NotificationType;
      data: { emailEnabled?: boolean; inAppEnabled?: boolean };
    }) => notificationApi.updatePreference(type, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences }),
  });
}
