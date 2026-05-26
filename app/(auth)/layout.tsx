import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ROUTES } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-4">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to home
        </Link>
        {children}
      </div>
    </div>
  );
}
