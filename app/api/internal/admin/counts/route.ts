import { NextResponse } from "next/server";

import { pool } from "@/auth.config";
import { serverEnv } from "@/lib/env.server";

/**
 * Internal-only counts the backend's AdminMetricsService aggregates with its own project / task /
 * subscription totals to populate the admin overview dashboard. Better Auth owns the user and
 * organisation tables so the backend can't read them directly.
 */
export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!serverEnv.internalServiceToken || token !== serverEnv.internalServiceToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [users, orgs] = await Promise.all([
    pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM "user"`),
    pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM organization`),
  ]);
  return NextResponse.json({
    users: Number(users.rows[0]?.n ?? 0),
    organisations: Number(orgs.rows[0]?.n ?? 0),
  });
}
