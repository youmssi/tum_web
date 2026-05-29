import type { Metadata } from "next";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { redirectLocalized } from "@/i18n/server-redirect";
import { ArrowLeftIcon } from "lucide-react";

import { CreateOrgForm } from "@/components/modules/organization";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create your workspace",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) await redirectLocalized(ROUTES.LOGIN);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-2">
        <Link
          href={ROUTES.WORKSPACES}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to workspaces
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your organisation to get started with Tûm.
          </p>
        </div>
        <CreateOrgForm />
      </div>
    </main>
  );
}
