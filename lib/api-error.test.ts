import { describe, expect, it } from "vitest";

import { ApiError, isPlanUpgradeError } from "@/lib/api-error";

describe("isPlanUpgradeError", () => {
  it("recognises the backend's plan refusal", () => {
    const error = new ApiError(402, { code: "plan_upgrade_required", requiredPlan: "PRO" });
    expect(isPlanUpgradeError(error)).toBe(true);
  });

  it("ignores other API errors and non-API errors", () => {
    expect(isPlanUpgradeError(new ApiError(402, { title: "Payment Required" }))).toBe(false);
    expect(isPlanUpgradeError(new ApiError(403, { code: "forbidden" }))).toBe(false);
    expect(isPlanUpgradeError(new Error("boom"))).toBe(false);
  });
});
