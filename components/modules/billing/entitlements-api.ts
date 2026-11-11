import { api } from "@/lib/api-client";

export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export type Feature =
  | "CRITICAL_PATH"
  | "BASELINES"
  | "WORKLOAD"
  | "ANALYTICS"
  | "PORTFOLIO"
  | "AUDIT_LOG";

export interface Entitlements {
  plan: Plan;
  features: Feature[];
  limits: { maxProjects: number | null; maxMembers: number | null };
}

/** The lowest plan that includes each feature. Mirrors the backend's Feature enum. */
export const FEATURE_PLAN: Record<Feature, Exclude<Plan, "FREE">> = {
  CRITICAL_PATH: "PRO",
  BASELINES: "PRO",
  WORKLOAD: "PRO",
  ANALYTICS: "PRO",
  PORTFOLIO: "PRO",
  AUDIT_LOG: "ENTERPRISE",
};

export const entitlementsApi = {
  get: () => api.get("api/billing/entitlements").json<Entitlements>(),
};
