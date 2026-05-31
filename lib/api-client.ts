import ky from "ky";

import { ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import { parseApiError } from "@/lib/api-error";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getJwt(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - now > 30_000) {
    return cachedToken.value;
  }

  try {
    const res = await fetch(`${env.betterAuthUrl}/api/auth/token`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    if (!data.token) return null;
    cachedToken = { value: data.token, expiresAt: now + 55 * 60 * 1000 };
    return data.token;
  } catch {
    return null;
  }
}

export function clearTokenCache() {
  cachedToken = null;
}

export const api = ky.create({
  prefix: env.apiBaseUrl,
  retry: { limit: 1 },
  timeout: 20_000,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const token = await getJwt();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (response.status === 401) {
          cachedToken = null;
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.LOGIN;
          }
          return;
        }
        if (!response.ok) {
          throw await parseApiError(response.clone());
        }
      },
    ],
  },
});

/**
 * Same-origin ky client for Tûm's own Next.js {@code /api/**} routes (billing backfill, internal
 * forwarders, etc.). Different from {@link api} in three ways: no Spring prefix, no JWT
 * injection (Better Auth uses session cookies that the browser sends automatically), and no
 * 401 redirect dance — these routes either succeed or surface a parseApiError that the calling
 * hook can show. Use this everywhere we'd otherwise reach for plain {@code fetch} from the UI.
 */
export const webApi = ky.create({
  // Same-origin, no prefix.
  retry: { limit: 1 },
  timeout: 20_000,
  hooks: {
    afterResponse: [
      async ({ response }) => {
        if (!response.ok) {
          throw await parseApiError(response.clone());
        }
      },
    ],
  },
});
