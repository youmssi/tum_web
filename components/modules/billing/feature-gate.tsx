"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { Feature } from "./entitlements-api";
import { UpgradePrompt } from "./upgrade-prompt";
import { useFeatureAccess } from "./use-entitlements";

/**
 * Renders its children only when the active workspace's plan includes {@code feature}; otherwise
 * shows an upgrade prompt. Children are not mounted while locked, so their queries never fire.
 */
export function FeatureGate({
  feature,
  children,
}: {
  feature: Feature;
  children: React.ReactNode;
}) {
  const access = useFeatureAccess(feature);
  if (access === "loading") return <Skeleton className="h-64 w-full" />;
  if (access === "locked") return <UpgradePrompt feature={feature} />;
  return <>{children}</>;
}
