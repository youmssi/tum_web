import { betterAuth } from "better-auth";
import { jwt, organization } from "better-auth/plugins";
import { Pool } from "pg";

// This file is the single source of truth for the Better Auth config.
// It intentionally has no `server-only` import so the CLI can use it for migrations.
// App code must import from `lib/auth.ts` (which re-exports with the server-only guard).
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
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
    organization(),
    jwt({
      jwt: { expirationTime: "1h" },
      jwks: { keyPairConfig: { alg: "RS256" } },
    }),
  ],
});
