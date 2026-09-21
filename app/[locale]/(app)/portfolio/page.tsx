import type { Metadata } from "next";

import { PortfolioPage } from "@/components/modules/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioRoute() {
  return <PortfolioPage />;
}
