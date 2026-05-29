import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirectLocalized } from "@/i18n/server-redirect";

import { WorkspacePicker } from "@/components/modules/organization";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Choose workspace",
};

export default async function WorkspacesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    await redirectLocalized(ROUTES.LOGIN);
    return null;
  }
  if (session.session.activeOrganizationId) await redirectLocalized(ROUTES.DASHBOARD);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <WorkspacePicker />
    </main>
  );
}
