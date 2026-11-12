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
  phone: string;
}

export const dexpayApi = {
  plans: () => api.get("api/billing/dexpay/plans").json<DexpayPlanPrice[]>(),
  startCheckout: (input: DexpayCheckoutInput) =>
    api.post("api/billing/dexpay/checkout", { json: input }).json<{ paymentUrl: string }>(),
};
