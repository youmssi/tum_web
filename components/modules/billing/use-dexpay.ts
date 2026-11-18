"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import {
  type DexpayCheckoutInput,
  type DexpayPlanPrice,
  type DexpaySubscription,
  dexpayApi,
} from "./dexpay-api";
import { ENTITLEMENT_KEYS } from "./use-entitlements";

export const DEXPAY_KEYS = {
  plans: ["billing", "dexpay", "plans"] as const,
  subscription: (organizationId: string | undefined) =>
    ["billing", "dexpay", "subscription", organizationId] as const,
};

/**
 * Plans sold through Dexpay. An error or an empty list both mean "not available here": the
 * pricing page then asks the visitor to contact us, so the failure is not retried.
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

/** The active workspace's Dexpay subscription, or null when it has none. */
export function useDexpaySubscription() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  return useQuery<DexpaySubscription | null>({
    queryKey: DEXPAY_KEYS.subscription(activeOrg?.id),
    queryFn: () => dexpayApi.subscription(),
    enabled: !!activeOrg?.id,
    staleTime: 30_000,
  });
}

export function useCancelDexpaySubscription() {
  const qc = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  return useMutation({
    mutationFn: () => dexpayApi.cancel(),
    onSuccess: (subscription) => {
      qc.setQueryData(DEXPAY_KEYS.subscription(activeOrg?.id), subscription);
      qc.invalidateQueries({ queryKey: ENTITLEMENT_KEYS.forOrganization(activeOrg?.id) });
    },
  });
}
