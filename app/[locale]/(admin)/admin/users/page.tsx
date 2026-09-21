import type { Metadata } from "next";

import { AdminUsers } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every user across the platform.</p>
      </div>
      <AdminUsers />
    </div>
  );
}
