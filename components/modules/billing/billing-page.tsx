"use client";

import { ArrowUpRightIcon, CreditCardIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { useActiveSubscription, useOpenCustomerPortal } from "./use-billing";

/**
 * Customer billing page. All data + side-effects live in {@code use-billing.ts}; the component
 * itself is presentation-only. When the user has no active subscription we show a clear upgrade
 * CTA pointing at the landing-page pricing section.
 */
export function BillingPage() {
  const t = useTranslations("billing");
  const subscription = useActiveSubscription();
  const openPortal = useOpenCustomerPortal();

  // mutate() doesn't throw — error handling happens in onError. Removes the redundant try/catch
  // around mutateAsync that previously duplicated TanStack Query's own error pipeline.
  function handleOpenPortal() {
    openPortal.mutate(undefined, {
      onError: (err) => toast.error(err instanceof Error ? err.message : t("portalFailed")),
    });
  }

  if (subscription.isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const errorMessage = subscription.error instanceof Error ? subscription.error.message : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {errorMessage && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      )}

      {subscription.data ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscription.data.productName}
                  <Badge variant="outline">{subscription.data.status}</Badge>
                </CardTitle>
                <CardDescription>{t("activePlan")}</CardDescription>
              </div>
              <CreditCardIcon className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {subscription.data.amount !== null && subscription.data.currency && (
                <div>
                  <dt className="text-muted-foreground">{t("amount")}</dt>
                  <dd className="font-medium">
                    {(subscription.data.amount / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: subscription.data.currency.toUpperCase(),
                    })}
                    {subscription.data.recurringInterval &&
                      ` / ${subscription.data.recurringInterval}`}
                  </dd>
                </div>
              )}
              {subscription.data.currentPeriodEnd && (
                <div>
                  <dt className="text-muted-foreground">{t("renewsOn")}</dt>
                  <dd className="font-medium">
                    {new Date(subscription.data.currentPeriodEnd).toLocaleDateString()}
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
      ) : !errorMessage ? (
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
      ) : null}
    </div>
  );
}
