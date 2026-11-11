import { describe, expect, it } from "vitest";

import { productMailto } from "@/lib/contact";

describe("productMailto", () => {
  it("prefixes the subject with the product reference", () => {
    expect(productMailto("contact@mrvin100.de", "Sales enquiry")).toBe(
      "mailto:contact@mrvin100.de?subject=%5BT%C3%BBm%5D%20Sales%20enquiry",
    );
  });
});
