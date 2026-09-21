import type { Metadata } from "next";

import { AdminAudit } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Audit log",
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-tenant audit trail of admin and security-relevant actions.
        </p>
      </div>
      <AdminAudit />
    </div>
  );
}
