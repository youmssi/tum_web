"use client";

import { CheckCircle2Icon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { useOpenCustomerPortal } from "./use-billing";

interface UpgradeSuccessProps {
  checkoutId?: string;
}

const AUTO_REDIRECT_SECONDS = 5;

/**
 * Landing page for the Polar success_url ({@code /upgrade/success?checkout_id=...}). Confirms the
 * subscription kicked off, offers a one-click jump into the Polar-hosted customer portal, and
 * auto-redirects to the dashboard after {@link AUTO_REDIRECT_SECONDS}. The user can click
 * "Go to dashboard now" to skip the wait, or "Manage billing" to stay long enough to open the
 * portal first.
 *
 * <p>We deliberately don't fetch the order here — the Polar webhook handler is the authoritative
 * source and updates the backend subscription table a moment later.
 */
export function UpgradeSuccess({ checkoutId }: UpgradeSuccessProps) {
  const router = useRouter();
  const openPortal = useOpenCustomerPortal();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);
  const [redirectPaused, setRedirectPaused] = useState(false);

  // Countdown + redirect. The portal mutation pauses the countdown so a slow Polar portal
  // open doesn't yank the user away before they get to it.
  useEffect(() => {
    if (redirectPaused) return;
    if (secondsLeft <= 0) {
      router.replace(`${ROUTES.DASHBOARD}?upgrade=success`);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, redirectPaused, router]);

  function handleOpenPortal() {
    // Pause the auto-redirect while the portal opens — Polar's hosted portal is a full
    // navigation so without this the user could be bounced back to /dashboard mid-click.
    setRedirectPaused(true);
    openPortal.mutate(undefined, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not open the billing portal.");
        setRedirectPaused(false);
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <CheckCircle2Icon className="size-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome to Tûm Pro</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your subscription is active. You&rsquo;ll be sent to your dashboard in {secondsLeft}s.
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
        <Button asChild>
          <Link href={`${ROUTES.DASHBOARD}?upgrade=success`}>Go to dashboard now</Link>
        </Button>
        <Button variant="outline" onClick={handleOpenPortal} disabled={openPortal.isPending}>
          {openPortal.isPending ? "Opening portal…" : "Manage billing"}
          {!openPortal.isPending && <ExternalLinkIcon className="ml-2 size-4" />}
        </Button>
      </div>
    </div>
  );
}
