import "server-only";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env.server";

/**
 * Tells the browser whether the authenticated user is an app-wide admin. Used by the sidebar to
 * decide whether to render the "Admin" entry — the actual gating is enforced by the backend's
 * {@code ROLE_APP_ADMIN} authority on every {@code /api/admin/**} call, so this endpoint is
 * purely a UI convenience.
 *
 * <p>Proxies the backend's existing {@code /internal/users/{id}/admin-status} endpoint so we
 * don't have to mint a JWT just to ask "am I admin" before the user even visits an admin page.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ isAdmin: false });
  try {
    const res = await fetch(
      `${serverEnv.internalApiUrl}/internal/users/${session.user.id}/admin-status`,
      {
        method: "GET",
        headers: { "X-Internal-Token": serverEnv.internalServiceToken },
        cache: "no-store",
      },
    );
    if (!res.ok) return NextResponse.json({ isAdmin: false });
    const data = (await res.json()) as { isAdmin?: boolean };
    return NextResponse.json({ isAdmin: data.isAdmin === true });
  } catch {
    // Backend unreachable: fail closed (treat as non-admin). The sidebar item stays hidden,
    // which is the safe default.
    return NextResponse.json({ isAdmin: false });
  }
}
