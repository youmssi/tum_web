"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ShieldIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrgSwitcher } from "@/components/modules/organization/org-switcher";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboardIcon },
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderKanbanIcon },
  { href: ROUTES.ORGANIZATION_MEMBERS, label: "Members", icon: UsersIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const currentRole =
    activeOrg?.members.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const isAdmin = currentRole === "owner" || currentRole === "admin";

  async function handleSignOut() {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <OrgSwitcher />
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(href)} tooltip={label}>
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-1">
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(ROUTES.ORGANIZATION_AUDIT)}
                tooltip="Audit log"
              >
                <Link href={ROUTES.ORGANIZATION_AUDIT}>
                  <ShieldIcon />
                  <span>Audit log</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(ROUTES.ORGANIZATION_SETTINGS)}
              tooltip="Settings"
            >
              <Link href={ROUTES.ORGANIZATION_SETTINGS}>
                <SettingsIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === ROUTES.PROFILE} tooltip="Profile">
              <Link href={ROUTES.PROFILE}>
                <UserIcon />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
