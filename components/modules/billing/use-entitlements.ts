"use client";

import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { type Entitlements, type Feature, entitlementsApi } from "./entitlements-api";

export const ENTITLEMENT_KEYS = {
  forOrganization: (organizationId: string | undefined) =>
    ["billing", "entitlements", organizationId] as const,
};

/** What the active workspace's plan allows. Keyed by workspace so switching refetches. */
export function useEntitlements(options?: { pollUntilPaid?: boolean }) {
  const { data: activeOrg } = authClient.useActiveOrganization();
  return useQuery<Entitlements>({
    queryKey: ENTITLEMENT_KEYS.forOrganization(activeOrg?.id),
    queryFn: () => entitlementsApi.get(),
    enabled: !!activeOrg?.id,
    staleTime: options?.pollUntilPaid ? 0 : 60_000,
    // Right after a payment the plan changes only once Dexpay's webhook lands, so the success
    // page keeps asking until it does.
    refetchInterval: (query) =>
      options?.pollUntilPaid && (query.state.data?.plan ?? "FREE") === "FREE" ? 3_000 : false,
  });
}

export type FeatureAccess = "loading" | "allowed" | "locked";

/**
 * Whether the active workspace may use {@code feature}. If the entitlements cannot be read the
 * feature is treated as allowed: the backend still refuses a locked request, and a transient
 * failure here should not hide a feature the workspace has paid for.
 */
export function useFeatureAccess(feature: Feature): FeatureAccess {
  const { data, isPending, isError } = useEntitlements();
  if (isError) return "allowed";
  if (isPending || !data) return "loading";
  return data.features.includes(feature) ? "allowed" : "locked";
}
