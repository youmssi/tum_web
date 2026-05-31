import "server-only";

import { serverEnv } from "@/lib/env.server";

/**
 * Server-only bridge from Polar webhook events to the Spring billing module. Lives outside
 * {@code auth.config.ts} so the auth file stays declarative — webhook handlers just call
 * {@code forwardSubscriptionEvent(payload)} and this module handles the projection + HTTP.
 *
 * <p>Endpoint is the backend's internal {@code /internal/billing/subscription}, gated by the
 * shared X-Internal-Token. A failed forward is logged and swallowed: Polar will retry the
 * webhook automatically, so we mustn't return an error to Polar just because the backend was
 * briefly unreachable (that would cause retry storms).
 */

type PolarPlanSlug = "pro" | "enterprise";

/**
 * Maps a Polar subscription payload to the backend's upsert shape. Returns null when the
 * payload is missing fields we need (e.g. the customer has no organisation reference yet) —
 * the caller can skip the forward without it being an error.
 */
interface PolarSubscriptionLike {
  id: string;
  status: string;
  currentPeriodEnd?: string | Date | null;
  trialEnd?: string | Date | null;
  cancelAtPeriodEnd?: boolean;
  customer?: { externalId?: string | null };
  metadata?: Record<string, unknown> | null;
  product?: {
    slug?: PolarPlanSlug | null;
    metadata?: Record<string, unknown> | null;
  };
}

interface SubscriptionWebhookRequest {
  organizationId: string;
  userId: string;
  plan: "PRO" | "ENTERPRISE";
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "REVOKED";
  polarSubscriptionId: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  metadataJson: string | null;
}

function asInstant(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.toISOString();
}

function normaliseStatus(raw: string): SubscriptionWebhookRequest["status"] | null {
  const upper = raw.toUpperCase().replaceAll("-", "_");
  switch (upper) {
    case "TRIALING":
    case "ACTIVE":
    case "PAST_DUE":
    case "CANCELED":
    case "REVOKED":
      return upper;
    case "INCOMPLETE":
    case "INCOMPLETE_EXPIRED":
      return "PAST_DUE";
    default:
      return null;
  }
}

function planFromPayload(sub: PolarSubscriptionLike): "PRO" | "ENTERPRISE" | null {
  // Prefer the product slug we configured in the Polar dashboard ("pro" / "enterprise").
  // Fall back to product metadata.plan if the slug isn't set.
  const slug = sub.product?.slug ?? null;
  if (slug === "pro") return "PRO";
  if (slug === "enterprise") return "ENTERPRISE";
  const meta = sub.product?.metadata?.plan;
  if (meta === "pro") return "PRO";
  if (meta === "enterprise") return "ENTERPRISE";
  return null;
}

function organizationIdFromPayload(sub: PolarSubscriptionLike): string | null {
  // The landing-page checkout passes referenceId: organizationId — Polar copies it onto the
  // subscription metadata. Until that wiring is shipped end-to-end, we also accept the raw
  // metadata key for forward compatibility.
  const fromMetadata = sub.metadata?.referenceId ?? sub.metadata?.organizationId;
  if (typeof fromMetadata === "string" && fromMetadata.length > 0) return fromMetadata;
  return null;
}

function projectPayload(sub: PolarSubscriptionLike): SubscriptionWebhookRequest | null {
  const organizationId = organizationIdFromPayload(sub);
  const userId = sub.customer?.externalId ?? null;
  const plan = planFromPayload(sub);
  const status = normaliseStatus(sub.status);
  const currentPeriodEnd = asInstant(sub.currentPeriodEnd);
  if (!organizationId || !userId || !plan || !status || !currentPeriodEnd) {
    return null;
  }
  return {
    organizationId,
    userId,
    plan,
    status,
    polarSubscriptionId: sub.id,
    currentPeriodEnd,
    trialEnd: asInstant(sub.trialEnd),
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    metadataJson: sub.metadata ? JSON.stringify(sub.metadata) : null,
  };
}

/**
 * Forwards a Polar subscription event to the backend. Returns true on a 2xx response, false
 * otherwise (logged, never throws — Polar will retry on its own).
 */
export async function forwardSubscriptionEvent(sub: PolarSubscriptionLike): Promise<boolean> {
  const projected = projectPayload(sub);
  if (!projected) {
    console.warn("[billing-bridge] skipping subscription event with missing fields", sub.id);
    return false;
  }
  try {
    const res = await fetch(`${serverEnv.internalApiUrl}/internal/billing/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": serverEnv.internalServiceToken,
      },
      body: JSON.stringify(projected),
    });
    if (!res.ok) {
      console.error(
        "[billing-bridge] backend rejected subscription event",
        sub.id,
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[billing-bridge] forward failed", sub.id, err);
    return false;
  }
}
