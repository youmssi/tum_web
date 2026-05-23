import { betterAuth } from "better-auth";
import { jwt, organization } from "better-auth/plugins";
import { Pool } from "pg";

// This file is the single source of truth for the Better Auth config.
// It intentionally has no `server-only` import so the CLI can use it for migrations.
// App code must import from `lib/auth.ts` (which re-exports with the server-only guard).

// Shared pool so definePayload can query member roles without a second connection.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await fetch(`${process.env.INTERNAL_API_URL ?? "http://localhost:8080"}/internal/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.INTERNAL_SERVICE_TOKEN ?? "dev-internal-token",
        },
        body: JSON.stringify({
          to: user.email,
          template: "verify-email",
          context: { url, name: user.name },
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    organization({
      sendInvitationEmail: async (data) => {
        const url = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/invitations/accept?token=${data.invitation.id}`;
        await fetch(`${process.env.INTERNAL_API_URL ?? "http://localhost:8080"}/internal/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Token": process.env.INTERNAL_SERVICE_TOKEN ?? "dev-internal-token",
          },
          body: JSON.stringify({
            to: data.email,
            template: "org-invitation",
            context: {
              organizationName: data.organization.name,
              inviterName: data.inviter.user?.name ?? data.inviter.user?.email ?? "",
              url,
            },
          }),
        });
      },
    }),
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: async ({ user, session }) => {
          const orgId =
            (session as unknown as { activeOrganizationId?: string }).activeOrganizationId ?? null;

          let roles: string[] = [];
          if (orgId) {
            try {
              const result = await pool.query<{ role: string }>(
                'SELECT role FROM "member" WHERE user_id = $1 AND organization_id = $2 LIMIT 1',
                [user.id, orgId],
              );
              const role = result.rows[0]?.role;
              if (role) roles = [role];
            } catch {
              // non-fatal: roles stays empty, user gets no admin authority
            }
          }

          return { org: orgId, roles };
        },
      },
      jwks: { keyPairConfig: { alg: "RS256" } },
    }),
  ],
});
