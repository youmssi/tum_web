import { describe, expect, it } from "vitest";

import { legacyHostRedirect } from "@/lib/legacy-host";

describe("legacyHostRedirect", () => {
  it("sends the retired Vercel hostname to production, keeping path and query", () => {
    const target = legacyHostRedirect("tum-app.vercel.app", "/fr/pricing?ref=x");
    expect(target?.toString()).toBe("https://tum.mrvin100.de/fr/pricing?ref=x");
  });

  it("ignores the port and letter case of the Host header", () => {
    expect(legacyHostRedirect("TUM-APP.vercel.app:443", "/")?.toString()).toBe(
      "https://tum.mrvin100.de/",
    );
  });

  it("leaves production, previews, localhost and a missing header alone", () => {
    expect(legacyHostRedirect("tum.mrvin100.de", "/pricing")).toBeNull();
    expect(legacyHostRedirect("tum-app-git-x.vercel.app", "/")).toBeNull();
    expect(legacyHostRedirect("localhost:3000", "/")).toBeNull();
    expect(legacyHostRedirect(null, "/")).toBeNull();
  });
});
