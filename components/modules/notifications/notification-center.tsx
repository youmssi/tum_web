"use client";

import { BellIcon, CheckCheckIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useStompSubscription } from "@/lib/use-stomp-subscription";
import { ROUTES } from "@/lib/constants";
import {
  NOTIFICATION_KEYS,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "./use-notifications";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationCenter() {
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const queryClient = useQueryClient();

  const userId = session?.user?.id ?? null;
  const orgId = activeOrg?.id ?? null;

  // Personal notification push
  useStompSubscription(
    userId ? `/user/${userId}/queue/notifications` : null,
    () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  );

  // Org-wide task events (refresh tasks across all tabs)
  useStompSubscription(
    orgId ? `/topic/org/${orgId}/tasks` : null,
    () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  );

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-4" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center p-0 text-[10px]"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex gap-1">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                title="Mark all as read"
              >
                <CheckCheckIcon className="size-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-7" asChild title="Preferences">
              <Link href={ROUTES.NOTIFICATION_PREFERENCES}>
                <SettingsIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications?.length ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-1 text-center">
              <BellIcon className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                    n.read ? "opacity-60" : ""
                  }`}
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id);
                  }}
                >
                  {!n.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                  {n.read && <span className="mt-1.5 size-2 shrink-0" />}
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-medium leading-snug">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
