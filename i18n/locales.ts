/**
 * Single source of truth for locale identifiers. The full list is the universe of locales the app
 * can serve; `DEFAULT_LOCALE` is the fallback when no preference is detectable. The locale is
 * stored in a cookie (no URL prefix) so existing routes don't change — Phase 10's full
 * localization epic can switch to URL-based routing if SEO requires it without churn at the
 * call-sites established here.
 */
export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "tum.locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
