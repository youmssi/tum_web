import type { Metadata } from "next";

import { UpgradeSuccess } from "@/components/modules/billing";

export const metadata: Metadata = {
  title: "Subscription active",
};

export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const { checkout_id: checkoutId } = await searchParams;
  return (
    <div className="p-6">
      <UpgradeSuccess checkoutId={checkoutId} />
    </div>
  );
}
