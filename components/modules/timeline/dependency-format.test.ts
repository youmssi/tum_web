import { describe, expect, it } from "vitest";

import { formatLag } from "./dependency-format";

describe("formatLag", () => {
  it("shows a lag with a plus sign, a lead with a minus sign, and nothing at zero", () => {
    expect(formatLag(3)).toBe(" +3d");
    expect(formatLag(-2)).toBe(" −2d");
    expect(formatLag(0)).toBe("");
  });
});
