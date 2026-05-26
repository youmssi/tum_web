"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const plans = [
  {
    name: "Free",
    description: "For individuals and small teams",
    monthly: 0,
    annual: 0,
    features: [
      "Up to 3 projects",
      "5 team members",
      "Gantt timeline view",
      "Task comments & @mentions",
      "Activity feed",
    ],
    cta: "Start free",
    href: ROUTES.SIGNUP,
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing teams",
    monthly: 15,
    annual: 12,
    features: [
      "Unlimited projects",
      "Unlimited members",
      "Everything in Free",
      "Custom statuses & labels",
      "Priority support",
      "Export PNG / PDF",
      "Advanced analytics",
    ],
    cta: "Start trial",
    href: ROUTES.SIGNUP,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organisations",
    monthly: null,
    annual: null,
    features: [
      "Everything in Pro",
      "SSO & SCIM provisioning",
      "Audit logs",
      "SLA guarantee",
      "Dedicated onboarding",
      "Custom contracts",
    ],
    cta: "Contact us",
    href: "mailto:hello@tum.so",
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
            Simple, transparent
            <br />
            <span className="text-muted-foreground">pricing.</span>
          </h2>
          <p className="text-muted-foreground">Start free and grow as you need.</p>
        </div>

        {/* Billing toggle */}
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
              Save 20%
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
              {plan.popular && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono rounded-full">
                  Most popular
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
                    <span className="text-muted-foreground text-sm">/mo</span>
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
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
