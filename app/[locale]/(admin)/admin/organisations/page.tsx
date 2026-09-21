import type { Metadata } from "next";

import { AdminOrganisations } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Organisations",
};

export default function AdminOrganisationsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Organisations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every workspace and its member count.</p>
      </div>
      <AdminOrganisations />
    </div>
  );
}
