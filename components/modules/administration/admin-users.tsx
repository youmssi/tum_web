"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { UsersIcon } from "lucide-react";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { type AdminUser } from "./admin-api";
import { useAdminUsers } from "./use-admin";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

const columns: ColumnDef<AdminUser, unknown>[] = [
  {
    accessorKey: "name",
    header: sortableHeader("User"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 font-medium">
        <Avatar className="size-7">
          <AvatarImage src={row.original.avatarUrl ?? undefined} alt={row.original.name} />
          <AvatarFallback className="text-xs">{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: sortableHeader("Email"),
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ getValue }) => (
      <Badge variant={getValue<boolean>() ? "default" : "secondary"} className="text-xs">
        {getValue<boolean>() ? "Verified" : "Unverified"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Joined"),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(getValue<string>()), "MMM d, yyyy")}
      </span>
    ),
  },
];

/**
 * App-admin "Users" page — every Better Auth user across every organisation. Read-only: this is
 * a monitoring surface, not a user-management console (promoting/demoting app-admins already
 * has its own flow via {@code Admins}).
 */
export function AdminUsers() {
  const { data, isLoading, isError, error } = useAdminUsers();

  const emptyState = useMemo(
    () => (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No users yet</EmptyTitle>
          <EmptyDescription>Users will show up here as people sign up.</EmptyDescription>
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
      filterColumnId="email"
      filterPlaceholder="Filter by email…"
      emptyState={emptyState}
    />
  );
}
