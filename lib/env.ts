export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  betterAuthUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  wsBaseUrl:
    process.env.NEXT_PUBLIC_WS_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tum-app.vercel.app",
  // Google Search Console verification token. Per-property token from
  // search.google.com/search-console — set on Vercel as NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  // When unset, app/layout.tsx omits the verification meta tag entirely (no stale token leaks).
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? null,
} as const;
