export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  betterAuthUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
} as const;
