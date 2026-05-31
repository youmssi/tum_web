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
  // Polar.sh payments — the plugin is only registered when accessToken is non-empty so dev
  // installs without a Polar account still build. server defaults to "sandbox"; flip to
  // "production" via env on the deployed environment.
  polar: {
    accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
    proProductId: process.env.POLAR_PRO_PRODUCT_ID ?? "",
    enterpriseProductId: process.env.POLAR_ENTERPRISE_PRODUCT_ID ?? "",
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
    server: (process.env.POLAR_SERVER ?? "sandbox") as "sandbox" | "production",
  },
} as const;
