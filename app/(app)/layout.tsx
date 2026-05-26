import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/modules/shell/app-nav";
import { NotificationCenter } from "@/components/modules/notifications";
import { ThemeToggle } from "@/components/modules/shell/theme-toggle";
import { CommandPalette } from "@/components/modules/search/command-palette";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.activeOrganizationId) {
    redirect(ROUTES.WORKSPACES);
  }

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
