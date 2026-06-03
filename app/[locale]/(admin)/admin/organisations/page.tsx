import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Organisations",
};

export default function AdminOrganisationsPage() {
  return (
    <AdminPlaceholder
      title="Organisations"
      description="Browse every workspace, its owner, and its current plan."
    />
  );
}
