"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const plans = [
  {
    name: "Community",
    description: "Self-hosted, forever free",
    monthly: 0,
    annual: 0,
    badge: null,
    features: [
      "Unlimited projects & tasks",
      "Unlimited team members",
      "Gantt timeline & Kanban board",
      "Task dependencies",
      "Activity feed & @mentions",
      "REST API access",
      "Docker Compose deploy",
      "Community forum support",
    ],
    cta: "Self-host for free",
    href: "https://github.com/youmssi/tum_infra",
    external: true,
    popular: false,
  },
  {
    name: "Pro",
    description: "Tûm Cloud, managed for you",
    monthly: 12,
    annual: 10,
    badge: "Most popular",
    features: [
      "Everything in Community",
      "Tûm Cloud hosting (zero ops)",
      "Advanced analytics & trends",
      "Export PNG / PDF",
      "30-day execution history",
      "Email support",
      "Automatic updates",
      "99.9% uptime SLA",
    ],
    cta: "Start 14-day trial",
    href: ROUTES.SIGNUP,
    external: false,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large or regulated teams",
    monthly: null,
    annual: null,
    badge: null,
    features: [
      "Everything in Pro",
      "SSO (SAML / LDAP)",
      "Full audit logs",
      "Custom data residency",
      "Dedicated onboarding",
      "SLA with priority support",
      "Custom contracts & invoicing",
      "OEM / white-label option",
    ],
    cta: "Contact sales",
    href: "mailto:enterprise@tum.so",
    external: true,
    popular: false,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-24 lg:py-32 border-t border-foreground/8">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-6 h-px bg-foreground/40" />
            Pricing
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
            Free to run yourself.
            <br />
            <span className="text-muted-foreground">Pay only for cloud.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            Tûm is open-source under a fair-code license. Self-host for free forever. Choose cloud
            hosting only when you want zero-ops convenience.
          </p>
        </div>

        {/* Billing toggle (only relevant for Pro) */}
        <div className="flex items-center gap-3 mb-12">
          <span className={`text-sm ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
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
            Annual
          </span>
          {annual && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-mono rounded">
              Save 17%
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.popular
                  ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-foreground/10 bg-card"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-bold mt-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-foreground/10">
                {plan.monthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">
                      ${annual ? plan.annual : plan.monthly}
                    </span>
                    <span className="text-muted-foreground text-sm">/mo per workspace</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full rounded-full group"
                asChild
              >
                <Link
                  href={plan.href}
                  target={plan.external ? "_blank" : undefined}
                  rel={plan.external ? "noopener noreferrer" : undefined}
                >
                  {plan.cta}
                  {plan.external ? (
                    <ExternalLink className="size-3.5 ml-1.5" />
                  ) : (
                    <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  )}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All plans include unlimited users.{" "}
          <span className="font-mono text-xs">
            Fair-code license — free for internal use, cannot be resold as a competing service.
          </span>
        </p>
      </div>
    </section>
  );
}
