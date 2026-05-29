"use client";

import { useQuery } from "@tanstack/react-query";

import { directoryApi, type DirectoryMember } from "./directory-api";

/**
 * Loads the active organisation's member directory from the backend (which validates against
 * Better Auth). Mention pickers, assignee selectors, and Phase 7 contributor lists all consume
 * this single source of truth so the UI never surfaces an id the backend would reject.
 *
 * Cached for 60 s on the client to match the backend's per-org cache TTL.
 */
export function useDirectory() {
  return useQuery<DirectoryMember[]>({
    queryKey: ["directory", "members"],
    queryFn: () => directoryApi.list(),
    staleTime: 60_000,
  });
}
