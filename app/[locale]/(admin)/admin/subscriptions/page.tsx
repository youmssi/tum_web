import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Subscriptions",
};

export default function AdminSubscriptionsPage() {
  return (
    <AdminPlaceholder
      title="Subscriptions"
      description="Active, past-due, and cancelled Polar subscriptions across all workspaces."
    />
  );
}
