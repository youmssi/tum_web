import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OnboardingChoice } from "@/components/modules/organization";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Get started",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(ROUTES.LOGIN);
  if (session.session.activeOrganizationId) redirect(ROUTES.DASHBOARD);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <OnboardingChoice />
    </main>
  );
}
