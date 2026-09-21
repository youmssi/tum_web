"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CreditCardIcon } from "lucide-react";
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
import { type AdminSubscription } from "./admin-api";
import { useAdminOrganisations, useAdminSubscriptions } from "./use-admin";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  PAST_DUE: "destructive",
  CANCELED: "destructive",
  REVOKED: "destructive",
};

interface Row extends AdminSubscription {
  organizationName: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "organizationName",
    header: sortableHeader("Organisation"),
    cell: ({ row }) =>
      row.original.organizationName || (
        <span className="text-muted-foreground font-mono text-xs">
          {row.original.organizationId}
        </span>
      ),
  },
  {
    accessorKey: "plan",
    header: sortableHeader("Plan"),
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: sortableHeader("Status"),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"} className="text-xs">
          {row.original.status}
        </Badge>
        {row.original.cancelAtPeriodEnd && (
          <span className="text-xs text-muted-foreground">(cancels at period end)</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "currentPeriodEnd",
    header: sortableHeader("Current period ends"),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(getValue<string>()), "MMM d, yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Since"),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(getValue<string>()), "MMM d, yyyy")}
      </span>
    ),
  },
];

/**
 * App-admin "Subscriptions" page — every subscription across every organisation. Organisation
 * names are joined client-side from {@link useAdminOrganisations} rather than having the backend
 * reach across modules for the join — see the comment on {@code AdminSubscriptionsService}.
 */
export function AdminSubscriptions() {
  const subs = useAdminSubscriptions();
  const orgs = useAdminOrganisations();

  const rows: Row[] = useMemo(() => {
    const orgNameById = new Map((orgs.data ?? []).map((o) => [o.id, o.name]));
    return (subs.data ?? []).map((sub) => ({
      ...sub,
      organizationName: orgNameById.get(sub.organizationId) ?? "",
    }));
  }, [subs.data, orgs.data]);

  const emptyState = useMemo(
    () => (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCardIcon />
          </EmptyMedia>
          <EmptyTitle>No subscriptions yet</EmptyTitle>
          <EmptyDescription>
            Paid workspaces will show up here once they subscribe.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ),
    [],
  );

  if (subs.isLoading || orgs.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (subs.isError) {
    return <AdminErrorState error={subs.error} />;
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterColumnId="organizationName"
      filterPlaceholder="Filter by organisation…"
      emptyState={emptyState}
    />
  );
}
