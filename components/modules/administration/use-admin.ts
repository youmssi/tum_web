"use client";

import { useQuery } from "@tanstack/react-query";

import { adminApi } from "./admin-api";

export const ADMIN_KEYS = {
  overview: ["admin", "overview"] as const,
  me: ["admin", "me"] as const,
};

/**
 * Loads the admin overview metrics. Backend returns 403 for non-admins so the query enters
 * isError; the consumer renders a "not authorised" state in that case.
 */
export function useAdminOverview() {
  return useQuery({
    queryKey: ADMIN_KEYS.overview,
    queryFn: () => adminApi.overview(),
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * Sidebar gate — true when the current user is an app admin. Cached aggressively because the
 * sidebar mounts on every page; the cookie-backed session changes drive the refetch.
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: ADMIN_KEYS.me,
    queryFn: () => adminApi.me(),
    staleTime: 5 * 60_000,
    retry: 0,
  });
}
