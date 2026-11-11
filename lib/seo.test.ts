import { describe, expect, it } from "vitest";

import { publicPageMetadata } from "@/lib/seo";

describe("publicPageMetadata", () => {
  it("builds a locale-prefixed canonical with hreflang alternates", () => {
    const meta = publicPageMetadata({
      locale: "fr",
      path: "/pricing",
      title: "Tarifs",
      description: "desc",
    });

    expect(meta.alternates?.canonical).toBe("https://tum.mrvin100.de/fr/pricing");
    expect(meta.alternates?.languages).toEqual({
      en: "https://tum.mrvin100.de/pricing",
      fr: "https://tum.mrvin100.de/fr/pricing",
      "x-default": "https://tum.mrvin100.de/pricing",
    });
  });
});
