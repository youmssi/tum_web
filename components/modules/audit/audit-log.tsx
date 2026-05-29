"use client";

import { ShieldAlertIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { useDirectory, type DirectoryMember } from "@/components/modules/organization";
import { STATUS_LABELS } from "@/components/modules/tasks";
import {
  AUDIT_ACTION_LABELS,
  type AuditAction,
  type AuditEntry,
  type AuditParams,
} from "./audit-api";
import { useAuditLog } from "./use-audit";

const PAGE_SIZE = 25;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7
    ? `${d}d ago`
    : new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function resolveMember(userId: string, directory: DirectoryMember[]): string {
  const m = directory.find((mem) => mem.userId === userId);
  // The directory endpoint guarantees `name` (server-side it falls back to email). The final
  // fallback is for ids of people who have left the org and are no longer in the directory.
  return m?.name ?? "Former member";
}

function renderDetail(entry: AuditEntry, directory: DirectoryMember[]): string {
  switch (entry.action) {
    case "TASK_CREATED":
      return entry.detail ?? "—";
    case "TASK_STATUS_CHANGED":
      return entry.detail
        ? (STATUS_LABELS[entry.detail as keyof typeof STATUS_LABELS] ?? entry.detail)
        : "—";
    case "TASK_ASSIGNED":
      return entry.detail ? resolveMember(entry.detail, directory) : "Unassigned";
    case "COMMENT_ADDED":
      return "—";
    default:
      return entry.detail ?? "—";
  }
}

export function AuditLog() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  // Names + roles come from our canonical backend directory (E14) so the audit table reads
  // "Vincent Youmssi" instead of "ehqsuTaY…" when Better Auth's local payload is partial.
  const { data: directory } = useDirectory();
  const directoryList = directory ?? [];

  // Role is still read from Better Auth's local activeOrg payload because that's the gate the
  // local UI checks before fetching anything; the directory wouldn't help here.
  const currentRole =
    activeOrg?.members.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const canView = currentRole === "owner" || currentRole === "admin";

  const [params, setParams] = useState<AuditParams>({ page: 1, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error } = useAuditLog(canView ? params : {});

  function setAction(value: string) {
    setParams((p) => ({ ...p, action: value === "__all__" ? undefined : value, page: 1 }));
  }

  if (!canView) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2">
        <ShieldAlertIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Only admins and owners can view the audit log.
        </p>
      </div>
    );
  }

  const entries = data?.entries ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const page = params.page ?? 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={params.action ?? "__all__"} onValueChange={setAction}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All actions</SelectItem>
            {(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((a) => (
              <SelectItem key={a} value={a}>
                {AUDIT_ACTION_LABELS[a]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {params.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParams({ page: 1, pageSize: PAGE_SIZE })}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-destructive/40">
          <ShieldAlertIcon className="size-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">Failed to load audit log</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred. Check your permissions."}
          </p>
        </div>
      ) : !entries.length ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <ShieldAlertIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No audit entries found.</p>
        </div>
      ) : (
        <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <p className="max-w-36 truncate text-sm font-medium">
                      {resolveMember(entry.actorId, directoryList)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-64 truncate text-sm text-muted-foreground">
                      {renderDetail(entry, directoryList)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className="text-xs text-muted-foreground"
                      title={new Date(entry.createdAt).toLocaleString()}
                    >
                      {relativeTime(entry.createdAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination — always visible once data has loaded */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total > 0
              ? `Page ${page} of ${totalPages} · ${total} ${total === 1 ? "entry" : "entries"}`
              : "0 entries"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
