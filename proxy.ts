import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIES, ROUTES } from "@/lib/constants";

const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.SIGNUP, "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === ROUTES.HOME ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get(AUTH_COOKIES.SESSION) ?? request.cookies.get(AUTH_COOKIES.SESSION_SECURE);

  if (!sessionCookie?.value) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
