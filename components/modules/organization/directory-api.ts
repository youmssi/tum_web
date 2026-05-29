import { api } from "@/lib/api-client";

/**
 * Shape of a row from {@code GET /api/organization/members}. Mirrors the backend's directory
 * projection — also reused by Phase 7 contributor / stargazer surfaces, so {@code avatarUrl}
 * is carried even when unused.
 */
export interface DirectoryMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export const directoryApi = {
  list: () => api.get("api/organization/members").json<DirectoryMember[]>(),
};
