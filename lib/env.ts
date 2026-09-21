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
  // Umami analytics — website ID for this project in the (already-hosted) Umami instance, and
  // that instance's tracking script URL. Both must be set for the script to load; leaving either
  // blank disables analytics entirely (no script injected, no requests made).
  umamiWebsiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? null,
  umamiSrc: process.env.NEXT_PUBLIC_UMAMI_SRC ?? null,
} as const;
