import type { Metadata } from "next";

import { FeatureGate } from "@/components/modules/billing";
import { PortfolioPage } from "@/components/modules/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioRoute() {
  return (
    <FeatureGate feature="PORTFOLIO">
      <PortfolioPage />
    </FeatureGate>
  );
}
