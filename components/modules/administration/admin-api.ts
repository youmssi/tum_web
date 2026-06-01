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

export const adminApi = {
  /** Read aggregate metrics for the overview page. Backend gates this on ROLE_APP_ADMIN. */
  overview: () => api.get("api/admin/overview").json<AdminMetrics>(),

  /**
   * Tell the browser whether the authenticated user is an app-wide admin. Used by the sidebar
   * to decide whether to render the Admin entry — the actual gating is enforced server-side.
   */
  me: () => webApi.get("/api/me/admin").json<{ isAdmin: boolean }>(),
};
