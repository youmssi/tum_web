"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCommandPalette } from "@/components/modules/search/use-command-palette";

export function SearchTrigger() {
  const t = useTranslations("shell.search");
  const { openPalette } = useCommandPalette();

  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden h-8 w-52 items-center justify-between gap-2 text-muted-foreground md:flex"
      onClick={openPalette}
    >
      <span className="flex items-center gap-2">
        <SearchIcon className="size-3.5 shrink-0" />
        <span className="text-xs">{t("shortcut")}</span>
      </span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  );
}
