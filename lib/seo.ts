import type { Metadata } from "next";

import { routing, localizedUrl, type Locale } from "@/i18n/routing";

/** Canonical, hreflang and social metadata for a public page that exists in every locale. */
export function publicPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const canonical = localizedUrl(locale as Locale, path);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
        "x-default": localizedUrl(routing.defaultLocale, path),
      },
    },
    openGraph: { title, description, url: canonical, siteName: "Tûm", locale },
    twitter: { title, description },
  };
}
