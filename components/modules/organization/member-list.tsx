"use client";

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontalIcon, ShieldAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { InviteMemberDialog } from "./invite-member-dialog";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

type Member = NonNullable<
  ReturnType<typeof authClient.useActiveOrganization>["data"]
>["members"][number];

type OrgData = NonNullable<ReturnType<typeof authClient.useActiveOrganization>["data"]>;
type Invitation = OrgData extends { invitations?: Array<infer I> } ? I : never;

function MemberTable({
  members,
  currentUserId,
  currentRole,
  onRoleChange,
  onRemove,
}: {
  members: Member[];
  currentUserId: string | undefined;
  currentRole: string;
  onRoleChange: (memberId: string, role: "admin" | "member") => void;
  onRemove: (memberId: string) => void;
}) {
  const canManage = currentRole === "owner" || currentRole === "admin";

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        id: "user",
        header: "Member",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {m.user?.name?.slice(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{m.user?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{m.user?.email ?? ""}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const isOwner = row.original.role === "owner";
          return (
            <Badge variant={isOwner ? "default" : "secondary"}>
              {ROLE_LABELS[row.original.role] ?? row.original.role}
            </Badge>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (!canManage) return null;
          const m = row.original;
          const isOwner = m.role === "owner";
          const isCurrentUser = m.userId === currentUserId;
          if (isOwner || isCurrentUser) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Member actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {m.role !== "admin" ? (
                  <DropdownMenuItem onClick={() => onRoleChange(m.id, "admin")}>
                    Make admin
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onRoleChange(m.id, "member")}>
                    Make member
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onRemove(m.id)}>
                  Remove member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 48,
      },
    ],
    [canManage, currentUserId, onRoleChange, onRemove],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions; React Compiler aware
  const table = useReactTable({
    data: members,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvitationTable({
  invitations,
  canManage,
  onCancel,
}: {
  invitations: Invitation[];
  canManage: boolean;
  onCancel: (id: string) => void;
}) {
  const columns = useMemo<ColumnDef<Invitation>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <p className="text-sm font-medium">{row.original.email}</p>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">{ROLE_LABELS[row.original.role] ?? row.original.role}</Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status as string;
          const variant =
            status === "pending" ? "outline" : status === "accepted" ? "default" : "secondary";
          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (!canManage || (row.original.status as string) !== "pending") return null;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onCancel(row.original.id)}
            >
              Cancel
            </Button>
          );
        },
        size: 80,
      },
    ],
    [canManage, onCancel],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions; React Compiler aware
  const table = useReactTable({
    data: invitations,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  if (invitations.length === 0) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
        <ShieldAlertIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No pending invitations.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function MemberList() {
  const t = useTranslations("organization.members");
  const { data: activeOrg, isPending, refetch } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const members = activeOrg?.members ?? [];
  const invitations = (activeOrg?.invitations ?? []) as Invitation[];
  const currentUserId = session?.user?.id;
  const currentRole = members.find((m) => m.userId === currentUserId)?.role ?? "member";
  const canManage = currentRole === "owner" || currentRole === "admin";

  async function handleRoleChange(memberId: string, role: "admin" | "member") {
    if (!activeOrg) return;
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
      organizationId: activeOrg.id,
    });
    if (error) {
      toast.error(error.message ?? "Failed to update role.");
      return;
    }
    toast.success("Role updated.");
    refetch();
  }

  async function handleRemove(memberId: string) {
    if (!activeOrg) return;
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
      organizationId: activeOrg.id,
    });
    if (error) {
      toast.error(error.message ?? "Failed to remove member.");
      return;
    }
    toast.success("Member removed.");
    refetch();
  }

  async function handleCancelInvitation(invitationId: string) {
    const { error } = await authClient.organization.cancelInvitation({ invitationId });
    if (error) {
      toast.error(error.message ?? "Failed to cancel invitation.");
      return;
    }
    toast.success("Invitation cancelled.");
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("headerTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("headerSubtitle", { org: activeOrg?.name ?? "—" })}
          </p>
        </div>
        {canManage && <InviteMemberDialog onInvited={() => refetch()} />}
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">
              {t("tabMembers")}
              <Badge variant="secondary" className="ml-2 text-xs">
                {members.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="invitations">
              {t("tabInvitations")}
              {invitations.filter((i) => i.status === "pending").length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {invitations.filter((i) => i.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="mt-4">
            <MemberTable
              members={members}
              currentUserId={currentUserId}
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="invitations" className="mt-4">
            <InvitationTable
              invitations={invitations}
              canManage={canManage}
              onCancel={handleCancelInvitation}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
