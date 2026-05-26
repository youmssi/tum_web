import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { TumLogo } from "./tum-logo";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
  Platform: [
    { label: "Dashboard", href: ROUTES.DASHBOARD },
    { label: "Timeline", href: ROUTES.PROJECTS },
    { label: "Task board", href: ROUTES.PROJECTS },
  ],
  Account: [
    { label: "Sign in", href: ROUTES.LOGIN },
    { label: "Sign up", href: ROUTES.SIGNUP },
    { label: "Accept invitation", href: ROUTES.INVITATIONS_ACCEPT },
  ],
};

export function FooterSection() {
  return (
    <footer className="border-t border-foreground/8 py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TumLogo className="size-7" />
              <span className="font-bold text-lg">Tûm</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Project execution & workflow visibility. Built for teams that care about shipping.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-foreground/8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Tûm. Open-source project management.</p>
          <p className="font-mono">v0.2 · phase-2b-gantt</p>
        </div>
      </div>
    </footer>
  );
}
