import { api } from "@/lib/api-client";

export type DexpayPlan = "PRO" | "ENTERPRISE";
export type DexpayInterval = "MONTHLY" | "YEARLY";

/** A plan that can be bought through Dexpay, at the price set on the Dexpay product. */
export interface DexpayPlanPrice {
  plan: DexpayPlan;
  interval: DexpayInterval;
  amount: number;
  currency: string;
}

export interface DexpayCheckoutInput {
  plan: DexpayPlan;
  interval: DexpayInterval;
  name: string;
  email: string;
  /** Needed only for the workspace's first payment, to create its Dexpay customer. */
  phone?: string;
}

export type DexpaySubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "REVOKED";

/** The workspace's Dexpay subscription as the billing page shows it. */
export interface DexpaySubscription {
  plan: DexpayPlan;
  status: DexpaySubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const dexpayApi = {
  plans: () => api.get("api/billing/dexpay/plans").json<DexpayPlanPrice[]>(),
  startCheckout: (input: DexpayCheckoutInput) =>
    api.post("api/billing/dexpay/checkout", { json: input }).json<{ paymentUrl: string }>(),
  /** Null when the workspace has never subscribed through Dexpay (the API answers 204). */
  subscription: async (): Promise<DexpaySubscription | null> => {
    const response = await api.get("api/billing/dexpay/subscription");
    return response.status === 204 ? null : response.json<DexpaySubscription>();
  },
  cancel: () => api.post("api/billing/dexpay/subscription/cancel").json<DexpaySubscription>(),
};
