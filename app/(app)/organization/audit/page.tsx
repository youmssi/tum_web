import type { Metadata } from "next";

import { AuditLog } from "@/components/modules/audit";

export const metadata: Metadata = { title: "Audit Log" };

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Security-relevant actions performed in your organisation.
        </p>
      </div>
      <AuditLog />
    </div>
  );
}
