"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useStartCheckout } from "@/components/modules/billing";
import { authClient } from "@/lib/auth-client";

type PlanKey = "community" | "pro" | "enterprise";

const PLAN_CONFIG: {
  key: PlanKey;
  monthly: number | null;
  annual: number | null;
  href: string;
  external: boolean;
  popular: boolean;
  hasBadge: boolean;
}[] = [
  {
    key: "community",
    monthly: 0,
    annual: 0,
    // Community is invitation-only: visitors book a 15-min call where we collect their email and
    // hand them the #tum-server Discord invite + the self-host docs. Keeps the funnel curated for
    // MVP and lets us match contributors / reviewers / early adopters to the right room.
    href: "https://cal.com/mrvin100/join-community",
    external: true,
    popular: false,
    hasBadge: false,
  },
  {
    key: "pro",
    monthly: 20,
    annual: 17,
    href: ROUTES.SIGNUP,
    external: false,
    popular: true,
    hasBadge: true,
  },
  {
    key: "enterprise",
    monthly: 99,
    annual: 84,
    href: "mailto:mrvin100mail@gmail.com",
    external: true,
    popular: false,
    hasBadge: false,
  },
];

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const plans = useTranslations("landing.pricing.plans");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const startCheckout = useStartCheckout();
  const [annual, setAnnual] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<"pro" | "enterprise" | null>(null);

  // Tell next-intl this is an array so the count comes back as a number rather than an error.
  const featuresFor = (key: PlanKey): string[] =>
    Array.from({ length: 8 }, (_, i) => plans(`${key}.features.${i}`));

  /**
   * Plan CTA dispatch. Authenticated visitors are routed straight to a Polar checkout via the
   * Better Auth adapter using the slug configured in auth.config.ts; visitors who aren't signed
   * in fall through to the signup flow with an upgrade intent the post-signup page can pick up.
   * Polar handles the entire payment surface (card, PayPal, subscription management).
   */
  async function handlePaidPlanClick(plan: "pro" | "enterprise") {
    if (!session) {
      router.push(`${ROUTES.SIGNUP}?intent=upgrade-${plan}`);
      return;
    }
    // Subscriptions are per-workspace. Without an active org the resulting subscription would
    // be orphaned (no organizationId to forward to the backend), so route the user through the
    // workspace picker first — they'll land back on the pricing tile after creating / picking
    // one.
    if (!activeOrg?.id) {
      router.push(`${ROUTES.WORKSPACES}?intent=upgrade-${plan}`);
      return;
    }
    setPendingPlan(plan);
    try {
      // Delegates to the billing service — the hook handles the Polar customer backfill so the
      // existing-user case (signed up before Polar was wired) succeeds on the first click.
      await startCheckout.mutateAsync({ slug: plan, organizationId: activeOrg.id });
      // The Polar SDK navigates the browser away on success; we only reach the next line if it
      // resolved without redirecting (e.g. product slug isn't configured), and in that case
      // the catch fires.
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start checkout. Try again.";
      toast.error(message);
      setPendingPlan(null);
    }
  }

  return (
    <section id="pricing" className="relative py-24 lg:py-32 border-t border-foreground/8">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            {t("sectionLabel")}
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
            {t("heading")}
            <br />
            <span className="text-muted-foreground">{t("headingAccent")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">{t("intro")}</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 mb-12">
          <span className={`text-sm ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("monthly")}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-12 h-6 bg-foreground/15 rounded-full p-0.5 transition-colors hover:bg-foreground/25"
          >
            <div
              className={`size-5 bg-foreground rounded-full transition-transform duration-300 ${
                annual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("annual")}
          </span>
          {annual && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-mono rounded">
              {t("annualSavings")}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLAN_CONFIG.map((plan, idx) => {
            const isPaid = plan.key === "pro" || plan.key === "enterprise";
            const pending = pendingPlan === plan.key;
            return (
              <div
                key={plan.key}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.popular
                    ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-foreground/10 bg-card"
                }`}
              >
                {plan.hasBadge && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono rounded-full">
                    {plans(`${plan.key}.badge`)}
                  </span>
                )}

                <div className="mb-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl font-bold mt-1">{plans(`${plan.key}.name`)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plans(`${plan.key}.description`)}
                  </p>
                </div>

                <div className="mb-6 pb-6 border-b border-foreground/10">
                  {plan.monthly !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">
                        ${annual ? plan.annual : plan.monthly}
                      </span>
                      <span className="text-muted-foreground text-sm">{t("perWorkspace")}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">{t("custom")}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {featuresFor(plan.key).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {isPaid ? (
                  <div className="space-y-2">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full rounded-full group"
                      onClick={() => handlePaidPlanClick(plan.key as "pro" | "enterprise")}
                      disabled={pending}
                    >
                      {pending ? "Opening checkout…" : plans(`${plan.key}.cta`)}
                      {!pending && (
                        <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      )}
                    </Button>
                    {plan.key === "enterprise" && (
                      <p className="text-center text-xs text-muted-foreground">
                        Need a custom plan?{" "}
                        <a className="underline hover:text-foreground" href={plan.href}>
                          Talk to sales
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" className="w-full rounded-full group" asChild>
                    <Link
                      href={plan.href}
                      target={plan.external ? "_blank" : undefined}
                      rel={plan.external ? "noopener noreferrer" : undefined}
                    >
                      {plans(`${plan.key}.cta`)}
                      {plan.external ? (
                        <ExternalLink className="size-3.5 ml-1.5" />
                      ) : (
                        <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("footer")} <span className="font-mono text-xs">{t("fairCodeNote")}</span>
        </p>
      </div>
    </section>
  );
}
