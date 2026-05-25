import { clearTokenCache } from "@/lib/api-client";
import { getQueryClient } from "@/lib/query-client";

/** Call this on every org switch so stale TanStack Query data is evicted and the JWT is refreshed. */
export function clearOrgCache() {
  clearTokenCache();
  getQueryClient().clear();
}
