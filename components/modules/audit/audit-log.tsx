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
import { AUDIT_ACTION_LABELS, type AuditAction, type AuditParams } from "./audit-api";
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

export function AuditLog() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentRole =
    activeOrg?.members.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const canView = currentRole === "owner" || currentRole === "admin";

  const [params, setParams] = useState<AuditParams>({ page: 1, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching } = useAuditLog(canView ? params : {});

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
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <p className="max-w-32 truncate font-mono text-xs">{entry.actorId}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-40 truncate font-mono text-xs">{entry.entityId}</p>
                    <p className="text-xs text-muted-foreground">{entry.entityType}</p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-48 truncate text-xs text-muted-foreground">
                      {entry.detail ?? "—"}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {data?.total ?? 0} entries
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
