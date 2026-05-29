"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/locales";

/**
 * Persist the user's chosen locale in a long-lived cookie and revalidate the current tree so the
 * next render picks up the new catalog. Called from the {@link LocaleSwitcher}.
 */
export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
