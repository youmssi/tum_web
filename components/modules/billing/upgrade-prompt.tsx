"use client";

import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { FEATURE_PLAN, type Feature } from "./entitlements-api";

export function UpgradePrompt({ feature }: { feature: Feature }) {
  const t = useTranslations("billing.upgrade");
  const plan = t(`plans.${FEATURE_PLAN[feature]}`);

  return (
    <Empty className="min-h-64 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LockIcon />
        </EmptyMedia>
        <EmptyTitle>{t("title", { feature: t(`features.${feature}`), plan })}</EmptyTitle>
        <EmptyDescription>{t(`descriptions.${feature}`)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={ROUTES.PRICING}>{t("cta", { plan })}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
