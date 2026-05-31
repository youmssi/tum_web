import { webApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

/**
 * Billing service. Wraps every Polar-adjacent network call so React components don't talk to
 * {@code fetch} or the Better Auth client directly. Pure functions, no React imports — pairs
 * with {@code use-billing.ts} which exposes TanStack Query hooks on top of these primitives.
 *
 * <p>Same project convention as {@code projectApi}, {@code taskApi}, {@code statusApi}: service
 * layer is dumb and synchronous-looking, hooks wrap it.
 */

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "revoked";

export interface ActiveSubscription {
  id: string;
  productName: string;
  status: SubscriptionStatus | string;
  currentPeriodEnd: string | null;
  amount: number | null;
  currency: string | null;
  recurringInterval: string | null;
}

export type CheckoutSlug = "pro" | "enterprise";

/**
 * Lazy-creates a Polar customer record for the authenticated user when one is missing. Backend
 * for the /billing flow — users who signed up before {@code POLAR_ACCESS_TOKEN} was wired have
 * no Polar customer, so {@code authClient.customer.state()} 500s on first call. This route is
 * a no-op when the customer already exists, so it's cheap to call pre-emptively.
 *
 * <p>Network failures are swallowed — the caller will retry the actual operation and surface a
 * better message if Polar still doesn't recognise the customer.
 */
async function ensureCustomer(): Promise<void> {
  // Leading slash is required — ky's URL resolution treats a no-slash path as relative to the
  // current page, which on a localised route like /fr/billing produces /fr/api/billing/... (404).
  await webApi.post("/api/billing/ensure-customer").catch(() => null);
}

/**
 * Distinct outcomes the billing surface can land in. The hooks use this so the UI can render
 * each state as a different empty / banner / data view instead of conflating them all into a
 * generic error.
 */
export type BillingState =
  | { kind: "no-subscription" }
  | { kind: "subscription"; subscription: ActiveSubscription }
  | { kind: "unconfigured"; message: string }; // Polar misconfigured (no token, missing scopes,
// bad server). User can keep using the app; billing is the only thing that's degraded.

function looksLikePolarMisconfigured(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("insufficient_scope") ||
    lower.includes("status 403") ||
    lower.includes("subscriptions list failed") ||
    lower.includes("polar customer creation failed")
  );
}

export const billingApi = {
  /**
   * Returns the user's billing state. Resolves rather than throws when Polar is partially
   * configured — the caller renders a friendly "billing temporarily unavailable" surface
   * instead of treating misconfig as a crash.
   */
  async getBillingState(): Promise<BillingState> {
    const fetchState = async () => authClient.customer.state();
    let result = await fetchState();
    if (result.error) {
      // Backfill the Polar customer once and retry. ensureCustomer returns a polar-scope-missing
      // status quietly when the token lacks customers:read/write; the retry below will surface
      // the same shape so we map it to "unconfigured".
      await ensureCustomer();
      result = await fetchState();
      if (result.error) {
        const message =
          (result.error as { message?: string }).message ?? "Could not load billing details.";
        if (looksLikePolarMisconfigured(message)) {
          return { kind: "unconfigured", message };
        }
        throw new Error(message);
      }
    }
    const subs = ((result.data as unknown as { activeSubscriptions?: unknown[] })
      ?.activeSubscriptions ?? []) as Array<{
      id: string;
      status: string;
      currentPeriodEnd: string | null;
      amount: number | null;
      currency: string | null;
      recurringInterval: string | null;
      product: { name: string };
    }>;
    const first = subs[0];
    if (!first) return { kind: "no-subscription" };
    return {
      kind: "subscription",
      subscription: {
        id: first.id,
        productName: first.product.name,
        status: first.status,
        currentPeriodEnd: first.currentPeriodEnd,
        amount: first.amount,
        currency: first.currency,
        recurringInterval: first.recurringInterval,
      },
    };
  },

  /** Opens the hosted Polar customer portal in the current tab. */
  async openCustomerPortal(): Promise<void> {
    await authClient.customer.portal();
  },

  /**
   * Starts a Polar checkout for the given slug ({@code pro} or {@code enterprise}). Ensures the
   * customer record exists first, then passes the active workspace id as {@code referenceId} so
   * Polar tags the resulting subscription with the org — the backend webhook bridge reads this
   * back as {@code organizationId} when projecting the event onto our domain model.
   */
  async startCheckout(input: { slug: CheckoutSlug; organizationId: string }): Promise<void> {
    await ensureCustomer();
    await authClient.checkout({ slug: input.slug, referenceId: input.organizationId });
  },
};
