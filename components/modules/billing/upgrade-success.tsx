"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { useEntitlements } from "./use-entitlements";

/**
 * Where Dexpay sends the buyer after paying. The plan changes when Dexpay's webhook reaches the
 * backend, a few seconds later, so the page waits for the workspace's entitlements to move off
 * the Free plan instead of assuming the payment already went through.
 */
export function UpgradeSuccess() {
  const t = useTranslations("billing.success");
  const plans = useTranslations("billing.upgrade.plans");
  const entitlements = useEntitlements({ pollUntilPaid: true });
  const plan = entitlements.data?.plan;
  const active = plan !== undefined && plan !== "FREE";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <CheckCircle2Icon className="size-12 text-primary" aria-hidden />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-base" role="status">
            {active ? (
              t("active", { plan: plans(plan) })
            ) : (
              <>
                <Spinner />
                {t("pending")}
              </>
            )}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={ROUTES.DASHBOARD}>{t("dashboard")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.BILLING}>{t("billing")}</Link>
        </Button>
      </div>
    </div>
  );
}
