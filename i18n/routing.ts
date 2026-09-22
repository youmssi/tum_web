import { defineRouting } from "next-intl/routing";
import { env } from "@/lib/env";

/**
 * Canonical i18n routing config consumed by the middleware, the navigation helpers, and the
 * request handler. URLs always carry the locale as the first segment (e.g. {@code /en/dashboard},
 * {@code /fr/dashboard}); requests without a locale are redirected to the user's preferred one
 * (cookie → {@code Accept-Language} → {@link DEFAULT_LOCALE}).
 *
 * Whenever adding a new locale, update {@link LOCALES} and add a {@code messages/<locale>.json}
 * catalog — the parity test ({@code messages/messages.test.ts}) will fail until every key is
 * translated.
 */
export const routing = defineRouting({
  locales: ["en", "fr"] as const,
  defaultLocale: "en",
  // "as-needed" omits the prefix for the default locale (cleaner URLs for English visitors) while
  // keeping it explicit for every other locale ({@code /fr/...}). Switching to "always" later only
  // requires changing this line.
  localePrefix: "as-needed",
  localeCookie: {
    name: "tum.locale",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];

/**
 * Absolute URL for a locale under the "as-needed" prefix strategy above: the default locale is
 * unprefixed, every other locale gets a leading segment. The single source of truth for this —
 * sitemap.ts, the homepage's canonical/hreflang metadata, and anywhere else that needs a
 * locale's public URL all import from here rather than re-deriving it, so they can't drift out
 * of sync with each other or with a future change to localePrefix.
 */
export function localizedUrl(locale: Locale): string {
  return locale === routing.defaultLocale ? env.siteUrl : `${env.siteUrl}/${locale}`;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
