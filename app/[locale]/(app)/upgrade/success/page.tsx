import type { Metadata } from "next";

import { UpgradeSuccess } from "@/components/modules/billing";

export const metadata: Metadata = {
  title: "Payment received",
};

export default function UpgradeSuccessPage() {
  return (
    <div className="p-6">
      <UpgradeSuccess />
    </div>
  );
}
