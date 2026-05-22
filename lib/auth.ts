import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

import { serverEnv } from "@/lib/env.server";

export const auth = betterAuth({
  database: new Pool({
    connectionString: serverEnv.databaseUrl,
  }),
  baseURL: serverEnv.betterAuthUrl,
  secret: serverEnv.betterAuthSecret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await fetch(`${serverEnv.internalApiUrl}/internal/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": serverEnv.internalServiceToken,
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
    google: serverEnv.google,
    github: serverEnv.github,
  },
  plugins: [
    organization(),
    jwt({
      jwt: {
        expirationTime: "1h",
      },
      jwks: {
        keyPairConfig: { alg: "RS256" },
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
