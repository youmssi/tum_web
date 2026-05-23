"use client";

import { ActivityIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { STATUS_LABELS, type TaskStatus, useTasks } from "@/components/modules/tasks";
import { type ActivityAction, type Activity } from "./activity-api";
import { useActivity } from "./use-activity";

const ACTION_VERB: Record<ActivityAction, string> = {
  TASK_CREATED: "created",
  TASK_STATUS_CHANGED: "updated",
  TASK_ASSIGNED: "assigned",
  COMMENT_ADDED: "commented on",
};

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

function ActivityItem({
  entry,
  actorName,
  actorInitials,
  targetTitle,
  detail,
}: {
  entry: Activity;
  actorName: string;
  actorInitials: string;
  targetTitle: string;
  detail: string | null;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="text-xs">{actorInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm">
          <span className="font-medium">{actorName}</span>{" "}
          <span className="text-muted-foreground">{ACTION_VERB[entry.action]}</span>{" "}
          <span className="font-medium">{targetTitle}</span>
          {detail && <span className="text-muted-foreground"> · {detail}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{relativeTime(entry.createdAt)}</p>
      </div>
    </div>
  );
}

export function ActivityFeed({ projectId }: { projectId: string }) {
  const { data: entries, isLoading } = useActivity(projectId);
  const { data: tasks } = useTasks(projectId);
  const { data: activeOrg } = authClient.useActiveOrganization();
  const members = activeOrg?.members ?? [];

  function memberName(userId: string) {
    const m = members.find((m) => m.userId === userId);
    return m?.user?.name ?? m?.user?.email ?? "Someone";
  }

  function taskTitle(taskId: string) {
    return tasks?.find((t) => t.id === taskId)?.title ?? "a task";
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
        <ActivityIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No activity yet. Create tasks and add comments to see the feed.
        </p>
      </div>
    );
  }

  function resolvedDetail(entry: Activity): string | null {
    if (!entry.detail) return null;
    switch (entry.action) {
      case "TASK_STATUS_CHANGED":
        return STATUS_LABELS[entry.detail as TaskStatus] ?? entry.detail;
      case "TASK_ASSIGNED":
        return memberName(entry.detail);
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const name = memberName(entry.actorId);
        return (
          <ActivityItem
            key={entry.id}
            entry={entry}
            actorName={name}
            actorInitials={name.slice(0, 2).toUpperCase()}
            targetTitle={taskTitle(entry.targetId)}
            detail={resolvedDetail(entry)}
          />
        );
      })}
    </div>
  );
}
