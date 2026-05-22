import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/modules/auth";
import { AUTH_COOKIES, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage() {
  const cookieStore = await cookies();
  const hasSession =
    cookieStore.has(AUTH_COOKIES.SESSION) || cookieStore.has(AUTH_COOKIES.SESSION_SECURE);

  if (hasSession) redirect(ROUTES.DASHBOARD);

  return <SignupForm />;
}
