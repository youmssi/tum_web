import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { routing } from "@/i18n/routing";

// Every route that requires auth or has no standalone SEO value — kept as one list so the
// locale-prefixed variants (below) can't drift out of sync with the bare ones. Path segments
// only (no leading locale) since next-intl's "as-needed" prefix puts every non-default locale
// (fr) under /fr/... while the default locale (en) stays unprefixed.
const PRIVATE_PATHS = [
  "/dashboard",
  "/projects",
  "/portfolio",
  "/billing",
  "/upgrade",
  "/profile",
  "/organization",
  "/notifications",
  "/onboarding",
  "/workspaces",
  "/invitations",
  "/login",
  "/signup",
  "/admin",
];

export default function robots(): MetadataRoute.Robots {
  const nonDefaultLocales = routing.locales.filter((l) => l !== routing.defaultLocale);
  const disallow = [
    "/api/",
    ...PRIVATE_PATHS,
    ...nonDefaultLocales.flatMap((locale) => PRIVATE_PATHS.map((p) => `/${locale}${p}`)),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
