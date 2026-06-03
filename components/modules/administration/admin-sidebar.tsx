"use client";

import {
  ActivityIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

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
import { ROUTES } from "@/lib/constants";

/**
 * Admin-area sidebar. Intentionally has no org switcher — admins operate across every tenant —
 * and a "Back to app" link at the foot so they can return to their regular workspace. Section
 * order mirrors the operational frequency: overview first, then the heavy data sets, audit at
 * the foot for occasional forensics.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  const items = [
    { href: ROUTES.ADMIN, label: "Overview", icon: LayoutDashboardIcon },
    { href: ROUTES.ADMIN_USERS, label: "Users", icon: UsersIcon },
    { href: ROUTES.ADMIN_ORGS, label: "Organisations", icon: BuildingIcon },
    { href: ROUTES.ADMIN_SUBSCRIPTIONS, label: "Subscriptions", icon: CreditCardIcon },
    { href: ROUTES.ADMIN_AUDIT, label: "Audit log", icon: ActivityIcon },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
          <ShieldIcon className="size-4 text-primary" />
          <span>Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
                tooltip={label}
              >
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to app">
              <Link href={ROUTES.DASHBOARD}>
                <ArrowLeftIcon />
                <span>Back to app</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
