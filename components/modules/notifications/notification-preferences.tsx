"use client";

import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { type NotificationType } from "./notification-api";
import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "./use-notifications";

const TYPE_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: "Task assigned to you",
  TASK_MENTIONED: "You are @mentioned",
  COMMENT_ADDED: "New comment on your task",
  TASK_STATUS_CHANGED: "Task status changed",
};

export function NotificationPreferences() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreference();

  async function toggle(
    type: NotificationType,
    field: "emailEnabled" | "inAppEnabled",
    current: boolean,
  ) {
    try {
      await update.mutateAsync({ type, data: { [field]: !current } });
    } catch {
      toast.error("Failed to update preference.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-6">
              <Skeleton className="h-5 w-9 rounded-full" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!prefs?.length) {
    return (
      <p className="text-sm text-muted-foreground">No preferences available.</p>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-3 flex items-center gap-4 pb-2">
        <span className="flex-1 text-xs text-muted-foreground">Notification type</span>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span className="w-9 text-center">Email</span>
          <span className="w-9 text-center">In-app</span>
        </div>
      </div>
      <Separator className="mb-3" />
      {prefs.map((pref) => (
        <div key={pref.type} className="flex items-center justify-between gap-4 py-2">
          <span className="flex-1 text-sm">{TYPE_LABELS[pref.type] ?? pref.type}</span>
          <div className="flex gap-6">
            <Switch
              checked={pref.emailEnabled}
              onCheckedChange={() => toggle(pref.type, "emailEnabled", pref.emailEnabled)}
              disabled={update.isPending}
              aria-label={`Email for ${TYPE_LABELS[pref.type]}`}
            />
            <Switch
              checked={pref.inAppEnabled}
              onCheckedChange={() => toggle(pref.type, "inAppEnabled", pref.inAppEnabled)}
              disabled={update.isPending}
              aria-label={`In-app for ${TYPE_LABELS[pref.type]}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
