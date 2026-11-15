"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { type DexpayCheckoutInput, type DexpayPlanPrice, dexpayApi } from "./dexpay-api";

export const DEXPAY_KEYS = { plans: ["billing", "dexpay", "plans"] as const };

/**
 * Plans sold through Dexpay. An error or an empty list both mean "not available here": the
 * caller falls back to the other checkout, so the failure is not retried or surfaced.
 */
export function useDexpayPlans() {
  return useQuery<DexpayPlanPrice[]>({
    queryKey: DEXPAY_KEYS.plans,
    queryFn: () => dexpayApi.plans(),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export function useStartDexpayCheckout() {
  return useMutation({
    mutationFn: (input: DexpayCheckoutInput) => dexpayApi.startCheckout(input),
  });
}
