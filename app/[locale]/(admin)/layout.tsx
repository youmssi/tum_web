import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirectLocalized } from "@/i18n/server-redirect";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/modules/administration";
import { LocaleSwitcher } from "@/components/modules/shell/locale-switcher";
import { ThemeToggle } from "@/components/modules/shell/theme-toggle";
import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env.server";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Layout for the admin area. Authenticates server-side (login redirect if no session) and then
 * proxies the backend's {@code /internal/users/{id}/admin-status} to decide whether the user may
 * see this area at all. Non-admins are bounced to the dashboard rather than rendered a
 * "forbidden" page — admins use a separate route, no one else should know it exists.
 *
 * <p>The shell is intentionally bare: no org switcher (admins operate across all tenants), no
 * notification bell (out of scope here), just a back-to-app link in the sidebar footer.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) await redirectLocalized(ROUTES.LOGIN);

  // Server-side admin gate. Done on layout level so we never even ship the admin sidebar/page
  // shell to non-admins. The backend is still the source of truth — every /api/admin/** call
  // re-checks via the JWT claim.
  let isAdmin = false;
  try {
    const res = await fetch(
      `${serverEnv.internalApiUrl}/internal/users/${session!.user.id}/admin-status`,
      {
        method: "GET",
        headers: { "X-Internal-Token": serverEnv.internalServiceToken },
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { isAdmin?: boolean };
      isAdmin = data.isAdmin === true;
    }
  } catch {
    // backend unreachable: fail closed, treat as non-admin
  }
  if (!isAdmin) await redirectLocalized(ROUTES.DASHBOARD);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
