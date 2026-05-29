import type { Metadata } from "next";

import { AcceptInvitationView } from "@/components/modules/organization";

export const metadata: Metadata = {
  title: "Accept invitation",
};

export default async function InvitationAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <AcceptInvitationView token={token} />
    </main>
  );
}
