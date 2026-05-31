"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type BillingState, type CheckoutSlug, billingApi } from "./billing-api";

/**
 * TanStack Query hooks for the billing surface. Components import from here, never call
 * {@link billingApi} or {@code fetch} directly. Follows the same pattern as {@code useProjects},
 * {@code useTasks}, {@code useStatuses}.
 */

export const BILLING_KEYS = {
  state: ["billing", "state"] as const,
};

/**
 * Reads the billing state. Resolves to one of three shapes — {@code no-subscription},
 * {@code subscription} or {@code unconfigured}. The unconfigured shape captures Polar misconfig
 * (missing token, missing scopes) so the UI can render a clean banner instead of crash-looping.
 */
export function useBillingState() {
  return useQuery<BillingState>({
    queryKey: BILLING_KEYS.state,
    queryFn: () => billingApi.getBillingState(),
    staleTime: 30_000,
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
 * the backend webhook bridge reads as {@code organizationId}. Invalidates the billing-state
 * query on success so a return to {@code /billing} shows the new subscription immediately.
 */
export function useStartCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { slug: CheckoutSlug; organizationId: string }) =>
      billingApi.startCheckout(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.state });
    },
  });
}
