import type { Metadata } from "next";

import { AdminOverview } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Overview",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate counts across every workspace.
        </p>
      </div>
      <AdminOverview />
    </div>
  );
}
