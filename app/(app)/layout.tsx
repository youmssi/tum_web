import Link from "next/link";

import { AppNav } from "@/components/modules/shell/app-nav";
import { ROUTES } from "@/lib/constants";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 shrink-0 border-r flex flex-col">
        <div className="h-14 flex items-center px-4 border-b font-bold text-lg">
          <Link href={ROUTES.DASHBOARD}>Tûm</Link>
        </div>
        <AppNav />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
