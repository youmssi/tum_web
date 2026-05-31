"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ActiveSubscription, type CheckoutSlug, billingApi } from "./billing-api";

/**
 * TanStack Query hooks for the billing surface. Components import from here, never call
 * {@link billingApi} or {@code fetch} directly. Follows the same pattern as {@code useProjects},
 * {@code useTasks}, {@code useStatuses}.
 */

export const BILLING_KEYS = {
  customerState: ["billing", "customer-state"] as const,
};

/**
 * Reads the user's active subscription. Cached for 30 s; auto-retries the backfill case via
 * {@link billingApi.getActiveSubscription}, so the consumer just sees a success/failure state.
 */
export function useActiveSubscription() {
  return useQuery<ActiveSubscription | null>({
    queryKey: BILLING_KEYS.customerState,
    queryFn: () => billingApi.getActiveSubscription(),
    staleTime: 30_000,
    // Subscription changes are rare; an aggressive retry just doubles 500s when Polar is mis-
    // configured. One automatic retry is plenty.
    retry: 1,
  });
}

/**
 * Mutation that opens the hosted Polar customer portal. The Polar SDK navigates the browser
 * away on success, so the resolve callback is mostly bookkeeping (toast / loading state).
 */
export function useOpenCustomerPortal() {
  return useMutation({
    mutationFn: () => billingApi.openCustomerPortal(),
  });
}

/**
 * Mutation that starts a checkout. Caller passes the slug AND the workspace id Polar should
 * tag the subscription with — Polar copies referenceId onto the subscription metadata which
 * the backend webhook bridge reads as {@code organizationId}. Invalidates the customer-state
 * query on success so a return to {@code /billing} shows the new subscription immediately.
 */
export function useStartCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { slug: CheckoutSlug; organizationId: string }) =>
      billingApi.startCheckout(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.customerState });
    },
  });
}
