import { NextResponse } from "next/server";

import { pool } from "@/auth.config";
import { serverEnv } from "@/lib/env.server";

/**
 * Internal-only resolver: maps an email to the Better Auth user id. Used by the backend's
 * AdminSeederService when seeding {@code TUM_ADMIN_EMAILS} into the {@code app_admin} table.
 *
 * <p>Returns {@code userId: null} when no user with that email exists yet — the seeder treats
 * that as "try again on next boot" rather than an error.
 */
export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const token = request.headers.get("x-internal-token");
  if (!serverEnv.internalServiceToken || token !== serverEnv.internalServiceToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
    [decoded],
  );
  const userId = result.rows[0]?.id ?? null;
  return NextResponse.json({ userId });
}
