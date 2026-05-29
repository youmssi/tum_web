import { NextResponse } from "next/server";

import { pool } from "@/auth.config";
import { serverEnv } from "@/lib/env.server";

/**
 * Internal-only directory endpoint. Returns the active members of an organization in a stable
 * shape ({@code DirectoryEntry}) so the backend can validate assignees/mentions and the web can
 * power autocomplete pickers. Sourced directly from Better Auth's {@code member} + {@code user}
 * tables (the same pool used by {@code definePayload}). Authorised by the shared
 * {@code X-Internal-Token}, identical to {@code /internal/email}.
 *
 * The returned shape is intentionally future-proof for Phase 7 stargazer / contributor lists:
 * {@code avatarUrl} is included now so we don't have to re-shape the projection later.
 */
interface DirectoryEntry {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

interface DirectoryRow {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const token = request.headers.get("x-internal-token");
  const expected = serverEnv.internalServiceToken;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const result = await pool.query<DirectoryRow>(
    `SELECT u.id            AS "userId",
            u.name          AS name,
            u.email         AS email,
            u.image         AS "avatarUrl",
            m.role          AS role
       FROM member m
       JOIN "user" u ON u.id = m."userId"
      WHERE m."organizationId" = $1
      ORDER BY u.name ASC NULLS LAST, u.email ASC`,
    [orgId],
  );

  const members: DirectoryEntry[] = result.rows.map((row) => ({
    userId: row.userId,
    name: row.name ?? row.email,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatarUrl,
  }));

  return NextResponse.json({ members });
}
