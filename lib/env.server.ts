import "server-only";

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL,
  betterAuthUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  internalApiUrl: process.env.INTERNAL_API_URL ?? "http://localhost:8080",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? "dev-internal-token",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  },
} as const;
