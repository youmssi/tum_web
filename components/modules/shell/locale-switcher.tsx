"use client";

import { GlobeIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/app/actions/set-locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locales";

/**
 * Tiny client component that flips the {@code tum.locale} cookie via a server action and asks
 * Next.js to re-render the tree with the new messages. Lives in the shell module so the nav can
 * include it; the server action lives next door in {@code app/actions/} so the same cookie write
 * is reusable from elsewhere (e.g. an onboarding step) later.
 */
export function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations("locale");
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === current) return;
    startTransition(async () => {
      await setLocaleAction(locale);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={pending}
          aria-label={t("label")}
        >
          <GlobeIcon className="size-3.5" />
          {LOCALE_LABELS[current]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => choose(loc)}
            data-active={loc === current}
            className="text-sm data-[active=true]:font-medium"
          >
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
