import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Tûm</h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Project execution &amp; workflow visibility.
          <br />
          <span className="text-sm">Full landing page coming soon.</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href={ROUTES.SIGNUP}>Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>Log in</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Have an invitation?{" "}
        <Link
          href={ROUTES.INVITATIONS_ACCEPT}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Accept it here →
        </Link>
      </p>
    </main>
  );
}
