import { NextResponse } from "next/server";

import { pool } from "@/auth.config";
import { serverEnv } from "@/lib/env.server";

/**
 * Internal-only listing of every Better Auth user, for the Spring app-admin "Users" page.
 * Better Auth owns the `user` table so the backend can't read it directly — same pattern as
 * `/api/internal/admin/counts`. Capped so a pathological instance can't return an unbounded
 * payload; the admin UI is a monitoring surface, not a full user-management export.
 */
const MAX_ROWS = 2000;

interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
}

export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  if (!serverEnv.internalServiceToken || token !== serverEnv.internalServiceToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await pool.query<AdminUserRow>(
    `SELECT id, name, email, "emailVerified" AS "emailVerified", image, "createdAt" AS "createdAt"
       FROM "user"
      ORDER BY "createdAt" DESC
      LIMIT $1`,
    [MAX_ROWS],
  );

  const users = result.rows.map((row) => ({
    id: row.id,
    name: row.name ?? row.email,
    email: row.email,
    emailVerified: row.emailVerified,
    avatarUrl: row.image,
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ users });
}
