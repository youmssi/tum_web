import type { DexpayInterval, DexpayPlan, DexpayPlanPrice } from "./dexpay-api";

export function findDexpayPlan(
  plans: DexpayPlanPrice[] | undefined,
  plan: DexpayPlan,
  interval: DexpayInterval,
): DexpayPlanPrice | undefined {
  return plans?.find((entry) => entry.plan === plan && entry.interval === interval);
}

/** XAF, XOF and GNF have no minor unit, so amounts are shown without decimals. */
export function formatDexpayPrice(price: DexpayPlanPrice, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(price.amount);
}

/** International format, as Dexpay requires: a plus sign, then 8 to 15 digits. */
export const INTERNATIONAL_PHONE = /^\+[1-9][0-9]{7,14}$/;
