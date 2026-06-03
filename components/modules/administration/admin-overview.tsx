"use client";

import {
  BuildingIcon,
  CreditCardIcon,
  FolderKanbanIcon,
  ListChecksIcon,
  MessageSquareIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "./use-admin";

interface MetricTileProps {
  label: string;
  value: number;
  icon: React.ElementType;
}

function MetricTile({ label, value, icon: Icon }: MetricTileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Admin overview dashboard — first page admins see at /admin. Aggregate counts across every
 * workspace plus a quick read on active subscriptions. Forbidden state shows when the user
 * landed on this page without admin authority (the backend will 403 the underlying call).
 */
export function AdminOverview() {
  const overview = useAdminOverview();

  if (overview.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (overview.isError) {
    const status =
      typeof (overview.error as { response?: { status?: number } })?.response?.status === "number"
        ? (overview.error as { response?: { status?: number } }).response?.status
        : null;
    const isForbidden = status === 403;
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
        <ShieldAlertIcon className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isForbidden ? "You don't have admin access." : "Could not load the admin overview."}
        </p>
      </div>
    );
  }

  const m = overview.data;
  if (!m) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <MetricTile label="Users" value={m.users} icon={UsersIcon} />
      <MetricTile label="Organisations" value={m.organisations} icon={BuildingIcon} />
      <MetricTile label="Projects" value={m.projects} icon={FolderKanbanIcon} />
      <MetricTile label="Tasks" value={m.tasks} icon={ListChecksIcon} />
      <MetricTile label="Comments" value={m.comments} icon={MessageSquareIcon} />
      <MetricTile
        label="Active subscriptions"
        value={m.activeSubscriptions}
        icon={CreditCardIcon}
      />
    </div>
  );
}
