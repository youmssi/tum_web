import ky from "ky";

import { env } from "@/lib/env";

/**
 * Shared HTTP client for the Tûm backend API.
 *
 * Auth (Bearer JWT from Better Auth) and 401 refresh handling are added in
 * story TUM-E01-F03 via ky `hooks.beforeRequest` / `hooks.afterResponse`.
 */
export const api = ky.create({
  // ky v2 renamed `prefixUrl` -> `prefix`.
  prefix: env.apiBaseUrl,
  retry: { limit: 1 },
  timeout: 20_000,
});
