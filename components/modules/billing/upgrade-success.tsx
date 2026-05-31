"use client";

import { CheckCircle2Icon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { useOpenCustomerPortal } from "./use-billing";

interface UpgradeSuccessProps {
  checkoutId?: string;
}

/**
 * Landing page for the Polar success_url ({@code /upgrade/success?checkout_id=...}). Confirms the
 * subscription kicked off and offers a one-click jump into the Polar-hosted customer portal where
 * the user can manage payment methods, invoices and cancellation. We deliberately don't try to
 * fetch the order here — the webhook handler is the authoritative source and updates the backend
 * a moment later.
 */
export function UpgradeSuccess({ checkoutId }: UpgradeSuccessProps) {
  const openPortal = useOpenCustomerPortal();

  function handleOpenPortal() {
    openPortal.mutate(undefined, {
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not open the billing portal."),
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <CheckCircle2Icon className="size-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome to Tûm Pro</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your subscription is active. You can manage your plan, payment method and invoices in the
        billing portal at any time.
      </p>

      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle className="text-base">What just happened</CardTitle>
          <CardDescription>
            Polar has processed your payment. You should receive a receipt by email within a few
            minutes, and your workspace already has Pro features enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-left text-sm text-muted-foreground">
          {checkoutId && (
            <p>
              Reference: <span className="font-mono">{checkoutId}</span>
            </p>
          )}
          <p>You can change billing cycle or cancel at any time from the portal.</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleOpenPortal} disabled={openPortal.isPending}>
          {openPortal.isPending ? "Opening portal…" : "Manage billing"}
          {!openPortal.isPending && <ExternalLinkIcon className="ml-2 size-4" />}
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
