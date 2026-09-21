"use client";

import { useQuery } from "@tanstack/react-query";

import { adminApi } from "./admin-api";

export const ADMIN_KEYS = {
  overview: ["admin", "overview"] as const,
  me: ["admin", "me"] as const,
  users: ["admin", "users"] as const,
  organisations: ["admin", "organisations"] as const,
  subscriptions: ["admin", "subscriptions"] as const,
  audit: ["admin", "audit"] as const,
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

export function useAdminUsers() {
  return useQuery({
    queryKey: ADMIN_KEYS.users,
    queryFn: () => adminApi.users(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminOrganisations() {
  return useQuery({
    queryKey: ADMIN_KEYS.organisations,
    queryFn: () => adminApi.organisations(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ADMIN_KEYS.subscriptions,
    queryFn: () => adminApi.subscriptions(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminAudit() {
  return useQuery({
    queryKey: ADMIN_KEYS.audit,
    queryFn: () => adminApi.audit(),
    staleTime: 15_000,
    retry: 1,
  });
}
