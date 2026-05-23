import type { Metadata } from "next";

import { MyWorkDashboard } from "@/components/modules/analytics";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My Work</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you across all projects.</p>
      </div>
      <MyWorkDashboard />
    </div>
  );
}
