import { useQuery } from "@tanstack/react-query";

import { portfolioApi } from "./portfolio-api";

export const PORTFOLIO_KEYS = {
  all: ["portfolio"] as const,
};

export function usePortfolio() {
  return useQuery({
    queryKey: PORTFOLIO_KEYS.all,
    queryFn: () => portfolioApi.get(),
  });
}
