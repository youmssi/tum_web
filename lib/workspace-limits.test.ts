import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_MEMBERSHIP_LIMIT,
  hasReachedWorkspaceLimit,
  membershipLimitFor,
} from "@/lib/workspace-limits";

const FREE = { plan: "FREE", limits: { maxProjects: 3, maxMembers: 5 } };
const PRO = { plan: "PRO", limits: { maxProjects: null, maxMembers: null } };

function apiReturning(byOrganization: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const organizationId = decodeURIComponent(String(input).split("/").pop() ?? "");
    const body = byOrganization[organizationId];
    if (body === undefined) return new Response(null, { status: 500 });
    return Response.json(body);
  });
  return {
    api: { baseUrl: "http://backend", serviceToken: "secret", fetch: fetchMock },
    fetchMock,
  };
}

describe("membershipLimitFor", () => {
  it("returns the Free plan's member cap", async () => {
    const { api, fetchMock } = apiReturning({ "org-1": FREE });

    expect(await membershipLimitFor("org-1", api)).toBe(5);
    expect(fetchMock).toHaveBeenCalledWith("http://backend/internal/billing/entitlements/org-1", {
      headers: { "X-Internal-Token": "secret" },
    });
  });

  it("falls back to the default when the plan has no cap", async () => {
    const { api } = apiReturning({ "org-1": PRO });
    expect(await membershipLimitFor("org-1", api)).toBe(DEFAULT_MEMBERSHIP_LIMIT);
  });

  it("falls back to the default when the backend fails or is unreachable", async () => {
    const { api } = apiReturning({});
    expect(await membershipLimitFor("org-1", api)).toBe(DEFAULT_MEMBERSHIP_LIMIT);

    const offline = { ...api, fetch: vi.fn().mockRejectedValue(new Error("offline")) };
    expect(await membershipLimitFor("org-1", offline)).toBe(DEFAULT_MEMBERSHIP_LIMIT);
  });
});

describe("hasReachedWorkspaceLimit", () => {
  it("lets a user with no workspace create one", async () => {
    const { api } = apiReturning({});
    expect(await hasReachedWorkspaceLimit([], api)).toBe(false);
  });

  it("blocks a second workspace while the user owns a Free one", async () => {
    const { api } = apiReturning({ "org-1": PRO, "org-2": FREE });
    expect(await hasReachedWorkspaceLimit(["org-1", "org-2"], api)).toBe(true);
  });

  it("allows more workspaces when every owned workspace is paid", async () => {
    const { api } = apiReturning({ "org-1": PRO, "org-2": PRO });
    expect(await hasReachedWorkspaceLimit(["org-1", "org-2"], api)).toBe(false);
  });

  it("does not block when a plan cannot be read", async () => {
    const { api } = apiReturning({});
    expect(await hasReachedWorkspaceLimit(["org-1"], api)).toBe(false);
  });
});
