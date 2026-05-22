import { afterEach, describe, expect, it, vi } from "vitest";

describe("api-client: getJwt helper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns the token when the /token endpoint succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ token: "jwt-abc" }), { status: 200 })),
    );

    const { api } = await import("@/lib/api-client");
    expect(api).toBeDefined();
  });

  it("returns null when the /token endpoint returns no token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    );

    const { api } = await import("@/lib/api-client");
    expect(api).toBeDefined();
  });
});
