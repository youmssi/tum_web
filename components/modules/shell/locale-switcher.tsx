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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";

/**
 * Compact, icon-only language toggle for the topbar (logged-in) and landing nav (logged-out).
 * Uses the next-intl router so a locale switch swaps only the {@code /[locale]} segment of the
 * current URL — query string, hash, and downstream segments are preserved. The cookie is also
 * updated by the router so the next plain navigation honours the choice.
 */
export function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === current) return;
    startTransition(() => {
      // next-intl's usePathname returns the path WITHOUT the locale prefix; router.replace then
      // re-prepends the new locale, preserving the rest of the URL (including resolved dynamic
      // segments).
      router.replace(pathname, { locale });
    });
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              disabled={pending}
              aria-label={t("label")}
            >
              <GlobeIcon className="size-4" />
              <span className="sr-only">{t("label")}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("label")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
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
