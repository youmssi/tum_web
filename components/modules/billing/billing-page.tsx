"use client";

import { ArrowUpRightIcon, CreditCardIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { useCancelDexpaySubscription, useDexpaySubscription } from "./use-dexpay";

/**
 * Workspace billing. Plans are sold through Dexpay only: this page shows the current plan, when
 * it renews or ends, and lets an owner or admin change or cancel it.
 */
export function BillingPage() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const subscription = useDexpaySubscription();
  const cancel = useCancelDexpaySubscription();
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const role = activeOrg?.members?.find((m) => m.userId === session?.user?.id)?.role;
  const canManage = role === "owner" || role === "admin";

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(iso));

  function handleCancel() {
    cancel.mutate(undefined, {
      onSuccess: () => toast.success(t("cancelDialog.done")),
      onError: () => toast.error(t("cancelDialog.failed")),
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {subscription.isLoading && <Skeleton className="h-40 w-full" />}

      {subscription.isError && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{t("loadFailed")}</CardContent>
        </Card>
      )}

      {subscription.data && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t("current.title", { plan: t(`upgrade.plans.${subscription.data.plan}`) })}
                  <Badge variant="outline">
                    {subscription.data.cancelAtPeriodEnd
                      ? t("status.CANCELLING")
                      : t(`status.${subscription.data.status}`)}
                  </Badge>
                </CardTitle>
                <CardDescription>{t("current.description")}</CardDescription>
              </div>
              <CreditCardIcon className="size-5 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <span className="text-muted-foreground">
                {subscription.data.cancelAtPeriodEnd ? t("current.endsOn") : t("current.renewsOn")}
              </span>{" "}
              <span className="font-medium">{formatDate(subscription.data.currentPeriodEnd)}</span>
            </p>
            <p className="text-muted-foreground">
              {subscription.data.cancelAtPeriodEnd
                ? t("current.cancelledNote", {
                    plan: t(`upgrade.plans.${subscription.data.plan}`),
                    date: formatDate(subscription.data.currentPeriodEnd),
                  })
                : subscription.data.status === "PAST_DUE"
                  ? t("current.pastDue")
                  : t("current.renewalNote")}
            </p>
            {canManage ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={ROUTES.PRICING}>{t("current.changePlan")}</Link>
                </Button>
                {!subscription.data.cancelAtPeriodEnd && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" disabled={cancel.isPending}>
                        {t("current.cancel")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("cancelDialog.title", {
                            plan: t(`upgrade.plans.${subscription.data.plan}`),
                          })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("cancelDialog.description", {
                            plan: t(`upgrade.plans.${subscription.data.plan}`),
                            date: formatDate(subscription.data.currentPeriodEnd),
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancelDialog.keep")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>
                          {t("cancelDialog.confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("ownerOnly")}</p>
            )}
          </CardContent>
        </Card>
      )}

      {subscription.data === null && (
        <Card>
          <CardHeader>
            <CardTitle>{t("noPlan.title")}</CardTitle>
            <CardDescription>{t("noPlan.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={ROUTES.PRICING}>
                {t("noPlan.viewPlans")}
                <ArrowUpRightIcon className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
