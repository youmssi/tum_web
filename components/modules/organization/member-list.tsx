"use client";

import { MoreHorizontalIcon } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { InviteMemberDialog } from "./invite-member-dialog";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function MemberList() {
  const { data: activeOrg, isPending, refetch } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const members = activeOrg?.members ?? [];
  const currentUserRole = members.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

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

  async function handleRemove(memberIdOrEmail: string) {
    if (!activeOrg) return;
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail,
      organizationId: activeOrg.id,
    });
    if (error) {
      toast.error(error.message ?? "Failed to remove member.");
      return;
    }
    toast.success("Member removed.");
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to {activeOrg?.name ?? "your organisation"}.
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              {canManage && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.userId === session?.user?.id;
              const isOwner = member.role === "owner";
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.slice(0, 2).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{member.user?.email ?? ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isOwner ? "default" : "secondary"}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isCurrentUser}>
                              <MoreHorizontalIcon className="size-4" />
                              <span className="sr-only">Member actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== "admin" ? (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, "admin")}
                              >
                                Make admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, "member")}
                              >
                                Make member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemove(member.id)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
