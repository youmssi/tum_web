import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * Resolves the active locale from the URL segment that the middleware extracted and loads the
 * matching message catalog. Falls back to {@code routing.defaultLocale} if the requested locale
 * isn't one we support (treated as "not found" rather than a runtime error — the page can call
 * {@code notFound()} to render the 404).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
