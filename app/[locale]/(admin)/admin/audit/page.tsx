import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Audit log",
};

export default function AdminAuditPage() {
  return (
    <AdminPlaceholder
      title="Audit log"
      description="Cross-tenant audit trail of admin and security-relevant actions."
    />
  );
}
