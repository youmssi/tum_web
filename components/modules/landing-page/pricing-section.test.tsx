import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";

const { state, toastError, push } = vi.hoisted(() => ({
  state: {
    plans: [] as { plan: string; interval: string; amount: number; currency: string }[],
    plansLoaded: true,
    currentPlan: "FREE",
    role: "owner",
  },
  toastError: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "u1", name: "Ada", email: "ada@example.test" } } }),
    useActiveOrganization: () => ({
      data: { id: "org-1", members: [{ userId: "u1", role: state.role }] },
    }),
  },
}));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/lib/analytics", () => ({ trackEvent: () => {} }));
vi.mock("@/components/modules/billing", async () => {
  const price = await import("@/components/modules/billing/dexpay-price");
  return {
    findDexpayPlan: price.findDexpayPlan,
    useEntitlements: () => ({ data: { plan: state.currentPlan } }),
    useDexpayPlans: () => ({
      data: state.plansLoaded ? state.plans : undefined,
      refetch: () => Promise.resolve({ data: state.plans }),
    }),
    DexpayCheckoutDialog: ({ price }: { price: { usdAmount: number; change?: boolean } | null }) =>
      price ? (
        <div role="dialog">
          Dexpay checkout for ${price.usdAmount}
          {price.change ? " (plan change)" : ""}
        </div>
      ) : null,
  };
});

import { PricingSection } from "./pricing-section";

describe("PricingSection", () => {
  beforeEach(() => {
    toastError.mockClear();
    push.mockClear();
    state.plans = [];
    state.plansLoaded = true;
    state.currentPlan = "FREE";
    state.role = "owner";
  });

  it("shows plan prices in US dollars only", () => {
    state.plans = [{ plan: "PRO", interval: "YEARLY", amount: 122400, currency: "XAF" }];
    render(<PricingSection />);

    expect(screen.getByText("$17")).toBeInTheDocument();
    expect(screen.getByText("$84")).toBeInTheDocument();
    expect(screen.queryByText(/XAF/)).not.toBeInTheDocument();
  });

  it("opens the Dexpay checkout with the yearly price in dollars", () => {
    state.plans = [{ plan: "PRO", interval: "YEARLY", amount: 122400, currency: "XAF" }];
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Dexpay checkout for $204");
  });

  it("never falls back to another provider when Dexpay does not sell the plan", () => {
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));

    expect(toastError).toHaveBeenCalledWith(expect.stringContaining("contact@mrvin100.de"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("lets a Pro workspace switch to Enterprise as a plan change", () => {
    state.currentPlan = "PRO";
    state.plans = [{ plan: "ENTERPRISE", interval: "YEARLY", amount: 605000, currency: "XAF" }];
    render(<PricingSection />);

    expect(screen.getByRole("button", { name: /Current plan/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Switch to Enterprise/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Dexpay checkout for $1008 (plan change)");
    expect(screen.getByText(/remaining days/)).toBeInTheDocument();
  });

  it("sends the current plan's button to billing instead of a second checkout", () => {
    state.currentPlan = "PRO";
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Current plan/ }));

    expect(push).toHaveBeenCalledWith("/billing");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets an admin subscribe but not a member", () => {
    state.role = "member";
    render(<PricingSection />);

    expect(screen.getAllByText(/Only the workspace owner or an admin/).length).toBeGreaterThan(0);
  });

  it("shows the amount of the Dexpay product when it is priced in dollars", () => {
    state.plans = [{ plan: "PRO", interval: "YEARLY", amount: 199, currency: "USD" }];
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Dexpay checkout for $199");
  });

  it("charges a Guinean franc product at the dollar list price", () => {
    state.plans = [{ plan: "PRO", interval: "MONTHLY", amount: 174000, currency: "GNF" }];
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("switch", { name: "Bill yearly" }));
    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Dexpay checkout for $20");
    expect(screen.queryByText(/174/)).not.toBeInTheDocument();
  });

  it("explains mobile money payment in GNF and that cards are not available yet", () => {
    render(<PricingSection />);

    expect(
      screen.getByText(/equivalent in Guinean francs \(GNF\) by mobile money/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Card payments \(Visa, Mastercard\) are coming soon/),
    ).toBeInTheDocument();
  });

  it("waits for the prices instead of reporting the plan unavailable while they load", async () => {
    state.plans = [{ plan: "PRO", interval: "YEARLY", amount: 1775000, currency: "GNF" }];
    state.plansLoaded = false;
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Dexpay checkout for $204");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("exposes the billing period toggle as a named switch", () => {
    render(<PricingSection />);

    const toggle = screen.getByRole("switch", { name: "Bill yearly" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});
