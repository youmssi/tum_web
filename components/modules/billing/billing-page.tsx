"use client";

import { ArrowUpRightIcon, CreditCardIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

interface ActiveSubscription {
  id: string;
  productName: string;
  status: string;
  currentPeriodEnd: string | null;
  amount: number | null;
  currency: string | null;
  recurringInterval: string | null;
}

/**
 * Customer billing page. Reads {@code authClient.customer.state()} to display the active plan and
 * routes through the hosted Polar customer portal for invoice download / payment-method changes /
 * cancellation. When the user has no active subscription we show the upgrade CTAs that link back
 * to the landing-page pricing section.
 */
export function BillingPage() {
  const t = useTranslations("billing");
  const [state, setState] = useState<{
    loading: boolean;
    subscription: ActiveSubscription | null;
    error: string | null;
  }>({ loading: true, subscription: null, error: null });
  const [portalPending, setPortalPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await authClient.customer.state();
        if (cancelled) return;
        if (error) {
          setState({ loading: false, subscription: null, error: error.message ?? t("loadFailed") });
          return;
        }
        // authClient.customer.state() returns the full customer payload — pick the first active
        // subscription. The shape is shared with the Polar SDK; we keep our internal projection
        // minimal so future Polar SDK changes don't ripple through the UI.
        const subs = ((data as unknown as { activeSubscriptions?: unknown[] })
          ?.activeSubscriptions ?? []) as Array<{
          id: string;
          status: string;
          currentPeriodEnd: string | null;
          amount: number | null;
          currency: string | null;
          recurringInterval: string | null;
          product: { name: string };
        }>;
        const first = subs[0] ?? null;
        setState({
          loading: false,
          subscription: first
            ? {
                id: first.id,
                productName: first.product.name,
                status: first.status,
                currentPeriodEnd: first.currentPeriodEnd,
                amount: first.amount,
                currency: first.currency,
                recurringInterval: first.recurringInterval,
              }
            : null,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : t("loadFailed");
        setState({ loading: false, subscription: null, error: message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleOpenPortal() {
    setPortalPending(true);
    try {
      await authClient.customer.portal();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("portalFailed");
      toast.error(message);
      setPortalPending(false);
    }
  }

  if (state.loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {state.error && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{state.error}</CardContent>
        </Card>
      )}

      {state.subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {state.subscription.productName}
                  <Badge variant="outline">{state.subscription.status}</Badge>
                </CardTitle>
                <CardDescription>{t("activePlan")}</CardDescription>
              </div>
              <CreditCardIcon className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {state.subscription.amount !== null && state.subscription.currency && (
                <div>
                  <dt className="text-muted-foreground">{t("amount")}</dt>
                  <dd className="font-medium">
                    {(state.subscription.amount / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: state.subscription.currency.toUpperCase(),
                    })}
                    {state.subscription.recurringInterval &&
                      ` / ${state.subscription.recurringInterval}`}
                  </dd>
                </div>
              )}
              {state.subscription.currentPeriodEnd && (
                <div>
                  <dt className="text-muted-foreground">{t("renewsOn")}</dt>
                  <dd className="font-medium">
                    {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
            <Button onClick={handleOpenPortal} disabled={portalPending}>
              {portalPending ? (
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
      ) : (
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
    </div>
  );
}
