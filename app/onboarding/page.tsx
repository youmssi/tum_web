import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CreateOrgForm } from "@/components/modules/organization";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create your workspace",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(ROUTES.LOGIN);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-2">
        <div className="mb-6 text-center">
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
