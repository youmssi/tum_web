"use client";

import { ChevronsUpDownIcon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { clearOrgCache } from "@/lib/org-switch";

export function OrgSwitcher() {
  const router = useRouter();
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const { data: orgs } = authClient.useListOrganizations();

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrg?.id) return;
    const { error } = await authClient.organization.setActive({ organizationId: orgId });
    if (error) return;
    clearOrgCache();
    router.push(ROUTES.DASHBOARD);
  }

  if (isPending) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarFallback className="rounded-md text-xs">
                {activeOrg?.name?.slice(0, 2).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeOrg?.name ?? "No organisation"}</span>
              <span className="truncate text-xs text-muted-foreground">
                {activeOrg?.slug ?? ""}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 shrink-0" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom" sideOffset={4}>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organisations
          </DropdownMenuLabel>
          {orgs?.map((org) => (
            <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)} className="gap-2">
              <Avatar className="h-6 w-6 rounded-sm">
                <AvatarFallback className="rounded-sm text-xs">
                  {org.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{org.name}</span>
              {org.id === activeOrg?.id && (
                <span className="ml-auto text-xs text-muted-foreground">Active</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(ROUTES.ONBOARDING)} className="gap-2">
            <PlusCircleIcon className="size-4" />
            <span>Create organisation</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
