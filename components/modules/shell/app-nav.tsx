"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CreditCardIcon,
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

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const currentRole =
    activeOrg?.members.find((m) => m.userId === session?.user?.id)?.role ?? "member";
  const isAdmin = currentRole === "owner" || currentRole === "admin";

  const navItems = [
    { href: ROUTES.DASHBOARD, label: t("dashboard"), icon: LayoutDashboardIcon },
    { href: ROUTES.PROJECTS, label: t("projects"), icon: FolderKanbanIcon },
    { href: ROUTES.ORGANIZATION_MEMBERS, label: t("members"), icon: UsersIcon },
  ];

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
          {navItems.map(({ href, label, icon: Icon }) => (
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
                tooltip={t("audit")}
              >
                <Link href={ROUTES.ORGANIZATION_AUDIT}>
                  <ShieldIcon />
                  <span>{t("audit")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(ROUTES.ORGANIZATION_SETTINGS)}
              tooltip={t("settings")}
            >
              <Link href={ROUTES.ORGANIZATION_SETTINGS}>
                <SettingsIcon />
                <span>{t("settings")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === ROUTES.PROFILE}
              tooltip={t("profile")}
            >
              <Link href={ROUTES.PROFILE}>
                <UserIcon />
                <span>{t("profile")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(ROUTES.BILLING)}
              tooltip={t("billing")}
            >
              <Link href={ROUTES.BILLING}>
                <CreditCardIcon />
                <span>{t("billing")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip={t("signOut")}>
              <LogOutIcon />
              <span>{t("signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
