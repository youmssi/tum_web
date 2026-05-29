import { getLocale } from "next-intl/server";

import { redirect as intlRedirect } from "./navigation";

/**
 * Server-side redirect helper that preserves the active locale. Wraps {@code next-intl}'s
 * {@code redirect}, which requires the locale to be passed explicitly — most server callers want
 * the current locale, so providing it automatically here keeps call-sites simple.
 *
 * Use this from layouts, page components, and route handlers rendering UI. (Pure data routes
 * under {@code app/api/} continue to use {@code next/navigation}'s {@code redirect}.)
 */
export async function redirectLocalized(href: string): Promise<void> {
  const locale = await getLocale();
  intlRedirect({ href, locale });
}
