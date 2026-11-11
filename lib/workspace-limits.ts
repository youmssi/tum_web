/**
 * Plan caps that are enforced where members and workspaces are created (Better Auth), using the
 * backend as the single source of truth for each workspace's plan.
 *
 * Kept free of `server-only` and of `lib/env.server` because `auth.config.ts` imports it and
 * must stay loadable by the Better Auth CLI.
 */

export interface InternalApi {
  baseUrl: string;
  serviceToken: string;
  fetch?: typeof fetch;
}

interface WorkspaceEntitlements {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  limits: { maxProjects: number | null; maxMembers: number | null };
}

/** Better Auth's own default, used whenever a plan sets no member cap. */
export const DEFAULT_MEMBERSHIP_LIMIT = 100;

async function entitlementsFor(
  organizationId: string,
  api: InternalApi,
): Promise<WorkspaceEntitlements | null> {
  try {
    const response = await (api.fetch ?? fetch)(
      `${api.baseUrl}/internal/billing/entitlements/${encodeURIComponent(organizationId)}`,
      { headers: { "X-Internal-Token": api.serviceToken } },
    );
    if (!response.ok) return null;
    return (await response.json()) as WorkspaceEntitlements;
  } catch {
    return null;
  }
}

/**
 * How many members the workspace may have. If the plan cannot be read the default applies:
 * a backend outage must not stop a paying workspace from adding people.
 */
export async function membershipLimitFor(organizationId: string, api: InternalApi) {
  const entitlements = await entitlementsFor(organizationId, api);
  return entitlements?.limits.maxMembers ?? DEFAULT_MEMBERSHIP_LIMIT;
}

/**
 * A user may own one workspace on the Free plan. Without this, the Free plan's project cap could
 * be sidestepped by creating a new free workspace for each batch of projects.
 */
export async function hasReachedWorkspaceLimit(ownedOrganizationIds: string[], api: InternalApi) {
  const entitlements = await Promise.all(
    ownedOrganizationIds.map((organizationId) => entitlementsFor(organizationId, api)),
  );
  return entitlements.some((entry) => entry?.plan === "FREE");
}
