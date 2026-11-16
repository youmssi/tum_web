import { describe, expect, it } from "vitest";

import type { DexpayPlanPrice } from "./dexpay-api";
import { INTERNATIONAL_PHONE, findDexpayPlan, formatDexpayPrice } from "./dexpay-price";

const plans: DexpayPlanPrice[] = [
  { plan: "PRO", interval: "MONTHLY", amount: 12000, currency: "XAF" },
  { plan: "ENTERPRISE", interval: "MONTHLY", amount: 60000, currency: "XAF" },
];

describe("findDexpayPlan", () => {
  it("finds the price for a plan and interval", () => {
    expect(findDexpayPlan(plans, "ENTERPRISE", "MONTHLY")?.amount).toBe(60000);
  });

  it("returns nothing when the option is not sold through Dexpay or prices are unavailable", () => {
    expect(findDexpayPlan(plans, "PRO", "YEARLY")).toBeUndefined();
    expect(findDexpayPlan(undefined, "PRO", "MONTHLY")).toBeUndefined();
  });
});

describe("formatDexpayPrice", () => {
  it("shows the currency code and no decimals", () => {
    const formatted = formatDexpayPrice(plans[0], "en").replace(/\s/g, " ");
    expect(formatted).toBe("XAF 12,000");
  });
});

describe("INTERNATIONAL_PHONE", () => {
  it("accepts numbers in international format only", () => {
    expect(INTERNATIONAL_PHONE.test("+237650000000")).toBe(true);
    expect(INTERNATIONAL_PHONE.test("650000000")).toBe(false);
    expect(INTERNATIONAL_PHONE.test("+0650000000")).toBe(false);
    expect(INTERNATIONAL_PHONE.test("+237 650 000 000")).toBe(false);
  });
});
