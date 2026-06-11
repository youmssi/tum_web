"use client";

import { useState } from "react";
import { ActivityIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirectory } from "@/components/modules/organization";
import { useStatusName } from "@/components/modules/projects";
import { type TaskStatus, useTasks } from "@/components/modules/tasks";
import { type ActivityAction, type Activity } from "./activity-api";
import { useActivity } from "./use-activity";

const PAGE_SIZE = 15;

const ACTION_VERB: Record<ActivityAction, string> = {
  TASK_CREATED: "created",
  TASK_STATUS_CHANGED: "updated status of",
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
    <div className="flex gap-3 border-b py-3 last:border-0">
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="text-xs">{actorInitials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <p className="text-sm leading-relaxed">
          <span className="font-medium">{actorName}</span>{" "}
          <span className="text-muted-foreground">{ACTION_VERB[entry.action]}</span>{" "}
          <span className="font-medium">{targetTitle}</span>
          {detail && <span className="text-muted-foreground"> · {detail}</span>}
        </p>
        <time className="shrink-0 text-xs text-muted-foreground">
          {relativeTime(entry.createdAt)}
        </time>
      </div>
    </div>
  );
}

function FeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ActivityFeedProps {
  projectId: string;
  /** When set, renders only the first N entries without pagination (for dashboard cards). */
  limit?: number;
}

export function ActivityFeed({ projectId, limit }: ActivityFeedProps) {
  const { data: entries, isLoading } = useActivity(projectId);
  const { data: tasks } = useTasks(projectId);
  // Use the canonical org directory from the backend (E14) — Better Auth's local
  // useActiveOrganization payload sometimes ships membership rows without a populated `user`
  // slot, which is what was leaking raw user ids into the feed.
  const { data: directory } = useDirectory();
  // E17 followup — resolve TASK_STATUS_CHANGED events against the project's configured names so
  // "Vincent updated status of <task> · Shipped" reads with the rename in place.
  const resolveStatusName = useStatusName(projectId);
  const [page, setPage] = useState(0);

  function memberName(userId: string) {
    const m = directory?.find((m) => m.userId === userId);
    // The directory endpoint guarantees `name` (it falls back to email server-side), so any
    // current org member always resolves to a human label. The final fallback covers ids of
    // people who have left the org and are no longer in the directory.
    return m?.name ?? "Former member";
  }

  function taskTitle(taskId: string) {
    return tasks?.find((t) => t.id === taskId)?.title ?? "a task";
  }

  function resolvedDetail(entry: Activity): string | null {
    if (!entry.detail) return null;
    switch (entry.action) {
      case "TASK_STATUS_CHANGED":
        // The event detail carries the immutable category (TODO / IN_PROGRESS / ...) — resolve to
        // the project's currently-configured display name. Falls back to the raw category string
        // if statuses haven't loaded yet (one render, transient).
        return resolveStatusName(entry.detail as TaskStatus);
      case "TASK_ASSIGNED":
        return memberName(entry.detail);
      default:
        return null;
    }
  }

  if (isLoading) return <FeedSkeleton rows={limit ?? 5} />;

  if (!entries?.length) {
    return (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ActivityIcon />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Create tasks and add comments to see the feed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  function renderItem(entry: Activity) {
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
  }

  // Compact / embedded mode — show first N items, no pagination
  if (limit !== undefined) {
    return (
      <div>
        {entries.slice(0, limit).map(renderItem)}
        {entries.length > limit && (
          <p className="pt-2 text-center text-xs text-muted-foreground">
            +{entries.length - limit} more entries — open the Activity tab to see all
          </p>
        )}
      </div>
    );
  }

  // Full paginated view
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const pageEntries = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-0">
      <div>{pageEntries.map(renderItem)}</div>

      <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
        <span>
          Page {page + 1} of {totalPages} · {entries.length} entries
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
