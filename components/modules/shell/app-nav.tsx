"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard" },
  { href: ROUTES.PROJECTS, label: "Projects" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  }

  return (
    <nav className="flex flex-col flex-1 p-2 gap-1">
      {NAV_ITEMS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
            pathname.startsWith(href) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </Link>
      ))}

      <div className="mt-auto space-y-1">
        <Link
          href={ROUTES.PROFILE}
          className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
            pathname === "/profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-sm font-medium text-left text-muted-foreground hover:bg-accent transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
