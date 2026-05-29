import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale, type Locale } from "./locales";

/**
 * Server-side locale resolution for next-intl. Precedence:
 *   1. The `tum.locale` cookie (explicit user choice — set by the locale switcher).
 *   2. The first matching locale in the `Accept-Language` header.
 *   3. {@link DEFAULT_LOCALE}.
 *
 * Returns both the locale and its loaded message catalog so the {@code NextIntlClientProvider}
 * in the root layout has everything it needs.
 */
export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerList = await headers();
  const accept = headerList.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.trim().split(";")[0].toLowerCase();
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }

  return DEFAULT_LOCALE;
}

export { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE };
