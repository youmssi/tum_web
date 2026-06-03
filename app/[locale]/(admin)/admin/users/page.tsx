import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/modules/administration";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export default function AdminUsersPage() {
  return (
    <AdminPlaceholder
      title="Users"
      description="Search and manage every user across the platform."
    />
  );
}
