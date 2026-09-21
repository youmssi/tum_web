"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { BuildingIcon } from "lucide-react";
import { useMemo } from "react";

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
import { type AdminOrganisation } from "./admin-api";
import { useAdminOrganisations } from "./use-admin";

const columns: ColumnDef<AdminOrganisation, unknown>[] = [
  {
    accessorKey: "name",
    header: sortableHeader("Organisation"),
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {getValue<string | null>() ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "memberCount",
    header: sortableHeader("Members"),
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
  },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Created"),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(getValue<string>()), "MMM d, yyyy")}
      </span>
    ),
  },
];

/** App-admin "Organisations" page — every workspace across the platform, with member counts. */
export function AdminOrganisations() {
  const { data, isLoading, isError, error } = useAdminOrganisations();

  const emptyState = useMemo(
    () => (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BuildingIcon />
          </EmptyMedia>
          <EmptyTitle>No organisations yet</EmptyTitle>
          <EmptyDescription>Workspaces will show up here as they are created.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ),
    [],
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <AdminErrorState error={error} />;
  }

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      filterColumnId="name"
      filterPlaceholder="Filter by name…"
      emptyState={emptyState}
    />
  );
}
