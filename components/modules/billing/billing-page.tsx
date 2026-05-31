"use client";

import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { useBillingState, useOpenCustomerPortal } from "./use-billing";

/**
 * Customer billing page. Three terminal states (besides loading): {@code no-subscription},
 * {@code subscription} (active plan + portal), and {@code unconfigured} (Polar token missing
 * or under-scoped — surface a clear admin-action notice instead of crashing).
 */
export function BillingPage() {
  const t = useTranslations("billing");
  const billing = useBillingState();
  const openPortal = useOpenCustomerPortal();

  function handleOpenPortal() {
    openPortal.mutate(undefined, {
      onError: (err) => toast.error(err instanceof Error ? err.message : t("portalFailed")),
    });
  }

  if (billing.isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {/* Manual refresh — useful when a payment has just completed and the Polar webhook is
            taking a few seconds to land. Saves the user from refreshing the whole page. */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => billing.refetch()}
          disabled={billing.isFetching}
          title="Refresh billing state"
        >
          <RefreshCwIcon
            className={`size-4 ${billing.isFetching ? "animate-spin" : ""}`}
            aria-hidden
          />
        </Button>
      </div>

      {billing.data?.kind === "subscription" && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {billing.data.subscription.productName}
                  <Badge variant="outline">{billing.data.subscription.status}</Badge>
                </CardTitle>
                <CardDescription>{t("activePlan")}</CardDescription>
              </div>
              <CreditCardIcon className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {billing.data.subscription.amount !== null && billing.data.subscription.currency && (
                <div>
                  <dt className="text-muted-foreground">{t("amount")}</dt>
                  <dd className="font-medium">
                    {(billing.data.subscription.amount / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: billing.data.subscription.currency.toUpperCase(),
                    })}
                    {billing.data.subscription.recurringInterval &&
                      ` / ${billing.data.subscription.recurringInterval}`}
                  </dd>
                </div>
              )}
              {billing.data.subscription.currentPeriodEnd && (
                <div>
                  <dt className="text-muted-foreground">{t("renewsOn")}</dt>
                  <dd className="font-medium">
                    {new Date(billing.data.subscription.currentPeriodEnd).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
            <Button onClick={handleOpenPortal} disabled={openPortal.isPending}>
              {openPortal.isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t("openingPortal")}
                </>
              ) : (
                <>
                  {t("openPortal")}
                  <ExternalLinkIcon className="ml-2 size-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {billing.data?.kind === "no-subscription" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("noPlan.title")}</CardTitle>
            <CardDescription>{t("noPlan.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`${ROUTES.HOME}#pricing`}>
                {t("noPlan.viewPlans")}
                <ArrowUpRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {billing.data?.kind === "unconfigured" && (
        <Card className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="size-5 shrink-0 text-amber-600" />
              <div>
                <CardTitle className="text-base">{t("unconfigured.title")}</CardTitle>
                <CardDescription>{t("unconfigured.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {billing.isError && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">
            {billing.error instanceof Error ? billing.error.message : t("loadFailed")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
