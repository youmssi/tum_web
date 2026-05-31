import "server-only";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env.server";

/**
 * Backfill endpoint that lazily creates a Polar customer record for the authenticated user when
 * one is missing. Necessary because users who signed up before {@code createCustomerOnSignUp}
 * was wired (i.e. before {@code POLAR_ACCESS_TOKEN} was set on the deployment) have no Polar
 * customer at all — every {@code authClient.customer.state()} call then 500s with
 * "Subscriptions list failed" because the Better Auth adapter tries to list subscriptions for a
 * customer that doesn't exist.
 *
 * The billing page and the landing-page Pro / Enterprise CTAs call this once before retrying so
 * existing accounts can pay too. New signups already get the customer auto-created at signup
 * time and skip this code path entirely.
 *
 * No-ops when Polar isn't configured (returns 200 so callers can continue without a special case).
 */
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!serverEnv.polar.accessToken) {
    // Polar isn't configured on this deployment — nothing to back-fill, no error either.
    return NextResponse.json({ status: "polar-disabled" });
  }

  const polar = new Polar({
    accessToken: serverEnv.polar.accessToken,
    server: serverEnv.polar.server,
  });

  // External id is the Better Auth user id, matching the createCustomerOnSignUp convention.
  const externalId = session.user.id;

  try {
    await polar.customers.getExternal({ externalId });
    return NextResponse.json({ status: "exists" });
  } catch {
    // 404 / not-found is the expected branch on first call.
  }

  try {
    await polar.customers.create({
      externalId,
      email: session.user.email,
      name: session.user.name ?? undefined,
    });
    return NextResponse.json({ status: "created" });
  } catch (err) {
    // A race with another tab can produce a duplicate-externalId error — surface it as "exists"
    // so the caller can move on instead of treating it as fatal.
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("already")) {
      return NextResponse.json({ status: "exists" });
    }
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
