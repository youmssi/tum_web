"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { HistoryIcon } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, sortableHeader } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminErrorState } from "./admin-error-state";
import { type AdminAuditEntry } from "./admin-api";
import { useAdminAudit, useAdminOrganisations, useAdminUsers } from "./use-admin";

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

interface Row extends AdminAuditEntry {
  organizationName: string;
  actorName: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "createdAt",
    header: sortableHeader("When"),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {format(new Date(getValue<string>()), "MMM d, HH:mm")}
      </span>
    ),
  },
  {
    accessorKey: "organizationName",
    header: sortableHeader("Organisation"),
    cell: ({ row }) => (
      <span className="block max-w-[160px] truncate">
        {row.original.organizationName || (
          <span className="text-muted-foreground font-mono text-xs">
            {row.original.organizationId}
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "actorName",
    header: sortableHeader("Actor"),
    cell: ({ row }) => (
      <span className="block max-w-[160px] truncate">
        {row.original.actorName || (
          <span className="text-muted-foreground font-mono text-xs">{row.original.actorId}</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: sortableHeader("Action"),
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs whitespace-nowrap">
        {formatAction(getValue<string>())}
      </Badge>
    ),
  },
  {
    accessorKey: "detail",
    header: "Detail",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground block max-w-[220px] truncate text-xs">
        {getValue<string | null>() ?? "—"}
      </span>
    ),
  },
];

/**
 * App-admin "Audit log" page — the most recent actions across every organisation (default 200
 * rows). Distinct from the org-scoped audit log at {@code /organization/audit}: this one has no
 * tenant filter and is gated on app-wide admin rather than org-admin. Organisation and actor
 * names are joined client-side from the Users/Organisations admin queries — see the comment on
 * {@code AdminAuditService} for why the backend doesn't do this join itself.
 */
export function AdminAudit() {
  const audit = useAdminAudit();
  const orgs = useAdminOrganisations();
  const users = useAdminUsers();

  const rows: Row[] = useMemo(() => {
    const orgNameById = new Map((orgs.data ?? []).map((o) => [o.id, o.name]));
    const userById = new Map((users.data ?? []).map((u) => [u.id, u]));
    return (audit.data ?? []).map((entry) => ({
      ...entry,
      organizationName: orgNameById.get(entry.organizationId) ?? "",
      actorName: userById.get(entry.actorId)?.name ?? "",
    }));
  }, [audit.data, orgs.data, users.data]);

  const emptyState = useMemo(
    () => (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>Actions across every workspace will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ),
    [],
  );

  if (audit.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (audit.isError) {
    return <AdminErrorState error={audit.error} />;
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterColumnId="actorName"
      filterPlaceholder="Filter by actor…"
      emptyState={emptyState}
    />
  );
}
