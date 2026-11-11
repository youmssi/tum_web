import { describe, expect, it } from "vitest";

import { companyLegalUrl, productMailto } from "@/lib/contact";

describe("productMailto", () => {
  it("prefixes the subject with the product reference", () => {
    expect(productMailto("contact@mrvin100.de", "Sales enquiry")).toBe(
      "mailto:contact@mrvin100.de?subject=%5BT%C3%BBm%5D%20Sales%20enquiry",
    );
  });
});

describe("companyLegalUrl", () => {
  it("points at the company site in the visitor's locale", () => {
    expect(companyLegalUrl("privacy", "fr")).toBe("https://mrvin100.de/fr/privacy");
    expect(companyLegalUrl("terms", "en")).toBe("https://mrvin100.de/en/terms");
  });
});
