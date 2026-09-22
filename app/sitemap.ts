import type { MetadataRoute } from "next";
import { routing, localizedUrl } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l)]));

  // The only public, indexable route today is the marketing homepage — everything else
  // (dashboard, projects, admin, billing, ...) sits behind auth and is excluded via robots.ts.
  // One <url> entry per locale, each cross-referencing every language version via hreflang, per
  // Google's sitemap-based hreflang guidance.
  return routing.locales.map((locale) => ({
    url: localizedUrl(locale),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
  }));
}
