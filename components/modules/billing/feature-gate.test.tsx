import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";
import { FeatureGate } from "./feature-gate";

// A plain holder rather than vi.fn(): Vitest reports a rejected promise returned by a mock as a
// test error, which would fail the "cannot be read" case even though the component handles it.
const entitlements = vi.hoisted(() => ({ load: (): Promise<unknown> => Promise.resolve(null) }));

vi.mock("./entitlements-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./entitlements-api")>()),
  entitlementsApi: { get: () => entitlements.load() },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { useActiveOrganization: () => ({ data: { id: "org-1" } }) },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...rest }: { children: React.ReactNode } & Record<string, unknown>) => {
    const props = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a {...props}>{children}</a>;
  },
}));

function renderGate() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <FeatureGate feature="PORTFOLIO">
        <p>Portfolio content</p>
      </FeatureGate>
    </QueryClientProvider>,
  );
}

const freePlan = { plan: "FREE", features: [], limits: { maxProjects: 3, maxMembers: 5 } };
const proPlan = {
  plan: "PRO",
  features: ["PORTFOLIO"],
  limits: { maxProjects: null, maxMembers: null },
};

describe("FeatureGate", () => {
  it("shows the feature when the plan includes it", async () => {
    entitlements.load = () => Promise.resolve(proPlan);
    renderGate();
    expect(await screen.findByText("Portfolio content")).toBeInTheDocument();
  });

  it("shows an upgrade prompt linking to pricing when the plan does not include it", async () => {
    entitlements.load = () => Promise.resolve(freePlan);
    renderGate();
    expect(await screen.findByText("Portfolio is part of the Pro plan")).toBeInTheDocument();
    expect(screen.queryByText("Portfolio content")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the Pro plan" })).toHaveAttribute(
      "href",
      "/pricing",
    );
  });

  it("renders neither content nor prompt while entitlements load", async () => {
    let finish: (value: typeof proPlan) => void = () => {};
    entitlements.load = () => new Promise((resolve) => (finish = resolve));
    renderGate();

    expect(screen.queryByText("Portfolio content")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    finish(proPlan);
    expect(await screen.findByText("Portfolio content")).toBeInTheDocument();
  });

  it("keeps the feature visible when entitlements cannot be read", async () => {
    entitlements.load = () => Promise.reject(new Error("network"));
    renderGate();
    expect(await screen.findByText("Portfolio content")).toBeInTheDocument();
  });
});
