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
