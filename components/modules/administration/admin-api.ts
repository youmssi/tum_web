import { api } from "@/lib/api-client";
import { webApi } from "@/lib/api-client";

/**
 * App-wide aggregate counts surfaced on the admin overview dashboard. Mirrors the backend's
 * {@code AdminMetrics} record.
 */
export interface AdminMetrics {
  users: number;
  organisations: number;
  projects: number;
  tasks: number;
  comments: number;
  activeSubscriptions: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AdminOrganisation {
  id: string;
  name: string;
  slug: string | null;
  memberCount: number;
  createdAt: string;
}

export interface AdminSubscription {
  organizationId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface AdminAuditEntry {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
}

export const adminApi = {
  /** Read aggregate metrics for the overview page. Backend gates this on ROLE_APP_ADMIN. */
  overview: () => api.get("api/admin/overview").json<AdminMetrics>(),

  /**
   * Tell the browser whether the authenticated user is an app-wide admin. Used by the sidebar
   * to decide whether to render the Admin entry — the actual gating is enforced server-side.
   */
  me: () => webApi.get("/api/me/admin").json<{ isAdmin: boolean }>(),

  /** Every Better Auth user, across every organisation. Backend gates this on ROLE_APP_ADMIN. */
  users: () => api.get("api/admin/users").json<AdminUser[]>(),

  /** Every organisation, with member counts. Backend gates this on ROLE_APP_ADMIN. */
  organisations: () => api.get("api/admin/organisations").json<AdminOrganisation[]>(),

  /** Every subscription across every organisation. Backend gates this on ROLE_APP_ADMIN. */
  subscriptions: () => api.get("api/admin/subscriptions").json<AdminSubscription[]>(),

  /**
   * The most recent audit entries across every organisation (default 200, capped at 1000).
   * Backend gates this on ROLE_APP_ADMIN.
   */
  audit: (limit?: number) =>
    api
      .get("api/admin/audit", { searchParams: limit ? { limit } : undefined })
      .json<AdminAuditEntry[]>(),
};
