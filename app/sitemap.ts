import type { MetadataRoute } from "next";
import { routing, localizedUrl } from "@/i18n/routing";
import { PUBLIC_MARKETING_PATHS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  // Everything else (dashboard, projects, admin, billing, ...) sits behind auth and is excluded
  // via robots.ts. One <url> entry per locale, each cross-referencing every language version via
  // hreflang, per Google's sitemap-based hreflang guidance.
  const paths = ["", ...PUBLIC_MARKETING_PATHS];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)]));
    return routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
