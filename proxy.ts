import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { AUTH_COOKIES, ROUTES } from "@/lib/constants";

/**
 * Composes locale resolution (from {@code next-intl}) with our session check. Order matters: the
 * intl middleware redirects when a locale prefix is missing so every downstream redirect targets
 * a properly-localised URL.
 *
 * Special files at the root of {@code app/} (favicon, manifest, robots, sitemap, etc.) and the
 * API surface are skipped by the matcher entirely — they're locale-agnostic resources.
 */
const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.INVITATIONS_ACCEPT];

/** Strip the optional locale prefix so we can match on the canonical app route. */
function stripLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes never need locale rewriting or auth at this layer.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Let next-intl decide the locale (it may issue a redirect — return that immediately).
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get("location")) return intlResponse;

  const bareRoute = stripLocale(pathname);
  const isPublic = bareRoute === ROUTES.HOME || PUBLIC_PATHS.some((p) => bareRoute.startsWith(p));

  if (isPublic) return intlResponse;

  const sessionCookie =
    request.cookies.get(AUTH_COOKIES.SESSION) ?? request.cookies.get(AUTH_COOKIES.SESSION_SECURE);

  if (!sessionCookie?.value) {
    // Send unauthenticated callers to login while preserving the locale they were on and the
    // page they were trying to reach.
    const url = request.nextUrl.clone();
    const locale = intlResponse.headers.get("x-middleware-request-x-next-intl-locale") ?? "";
    url.pathname = locale ? `/${locale}${ROUTES.LOGIN}` : ROUTES.LOGIN;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static files, and API routes.
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image).*)",
  ],
};
