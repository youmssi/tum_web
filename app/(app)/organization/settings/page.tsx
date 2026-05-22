import type { Metadata } from "next";

import { OrgSettingsForm } from "@/components/modules/organization";

export const metadata: Metadata = {
  title: "Organisation settings",
};

export default function OrgSettingsPage() {
  return (
    <div className="p-6">
      <OrgSettingsForm />
    </div>
  );
}
