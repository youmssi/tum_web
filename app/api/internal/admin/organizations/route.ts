import { NextResponse } from "next/server";

import { pool } from "@/auth.config";
import { serverEnv } from "@/lib/env.server";

/**
 * Internal-only listing of every Better Auth organisation (with member counts), for the Spring
 * app-admin "Organisations" page. Better Auth owns the `organization`/`member` tables so the
 * backend can't read them directly — same pattern as `/api/internal/admin/counts`.
 */
const MAX_ROWS = 2000;

interface AdminOrgRow {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  memberCount: string;
}

export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!serverEnv.internalServiceToken || token !== serverEnv.internalServiceToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await pool.query<AdminOrgRow>(
    `SELECT o.id, o.name, o.slug, o."createdAt" AS "createdAt",
            count(m.id)::text AS "memberCount"
       FROM organization o
       LEFT JOIN member m ON m."organizationId" = o.id
      GROUP BY o.id, o.name, o.slug, o."createdAt"
      ORDER BY o."createdAt" DESC
      LIMIT $1`,
    [MAX_ROWS],
  );

  const organizations = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    memberCount: Number(row.memberCount),
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ organizations });
}
