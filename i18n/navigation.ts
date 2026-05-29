import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these EVERYWHERE in app code instead of the equivalents
 * from {@code next/link} / {@code next/navigation} so the active locale prefix is preserved on
 * every link, push, replace, and redirect. The cookie-based fallback handles the default locale
 * (no prefix) transparently.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
