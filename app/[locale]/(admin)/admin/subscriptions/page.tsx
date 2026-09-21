import type { Metadata } from "next";

import { AdminSubscriptions } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Subscriptions",
};

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active, past-due, and cancelled Polar subscriptions across all workspaces.
        </p>
      </div>
      <AdminSubscriptions />
    </div>
  );
}
