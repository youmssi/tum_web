import "server-only";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env.server";

/**
 * Backfill endpoint that lazily creates a Polar customer record for the authenticated user when
 * one is missing.
 *
 * <p>Returns 200 in every "normal" branch so the calling UI can keep working when Polar is
 * partially configured (missing token, missing scopes, sandbox-vs-prod mismatch). 500 is
 * reserved for genuinely unexpected failures. Possible {@code status} values returned:
 *
 * <ul>
 *   <li>{@code "polar-disabled"} — no POLAR_ACCESS_TOKEN configured. UI should treat the user as
 *       not having a Polar customer and not surface a paid plan.
 *   <li>{@code "exists"} — customer already in Polar, no action taken.
 *   <li>{@code "created"} — customer was lazy-created on this call.
 *   <li>{@code "polar-scope-missing"} — Polar 403 (insufficient_scope). UI should show a clean
 *       "billing temporarily unavailable" state and log the action item: regenerate the OAT
 *       with the customers:read+write / subscriptions:read scopes. Status code stays 200.
 *   <li>{@code "polar-error"} — anything else Polar returned. 200 — billing is non-fatal.
 * </ul>
 */
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!serverEnv.polar.accessToken) {
    return NextResponse.json({ status: "polar-disabled" });
  }

  const polar = new Polar({
    accessToken: serverEnv.polar.accessToken,
    server: serverEnv.polar.server,
  });

  const externalId = session.user.id;

  try {
    await polar.customers.getExternal({ externalId });
    return NextResponse.json({ status: "exists" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("insufficient_scope") || message.includes("Status 403")) {
      console.warn(
        "[polar] ensure-customer: token lacks customers:read scope — regenerate the OAT",
      );
      return NextResponse.json({ status: "polar-scope-missing", message });
    }
    // Genuine "not found" — fall through to create.
  }

  try {
    await polar.customers.create({
      externalId,
      email: session.user.email,
      name: session.user.name ?? undefined,
    });
    return NextResponse.json({ status: "created" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("already")) {
      return NextResponse.json({ status: "exists" });
    }
    if (message.includes("insufficient_scope") || message.includes("Status 403")) {
      console.warn(
        "[polar] ensure-customer: token lacks customers:write scope — regenerate the OAT",
      );
      return NextResponse.json({ status: "polar-scope-missing", message });
    }
    console.error("[polar] ensure-customer failed", err);
    return NextResponse.json({ status: "polar-error", message });
  }
}
