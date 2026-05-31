import type { Metadata } from "next";

import { BillingPage } from "@/components/modules/billing";

export const metadata: Metadata = {
  title: "Billing",
};

export default function Page() {
  return (
    <div className="p-6">
      <BillingPage />
    </div>
  );
}
