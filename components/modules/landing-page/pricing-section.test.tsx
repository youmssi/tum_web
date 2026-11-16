import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";

const { state, toastError, push } = vi.hoisted(() => ({
  state: { plans: [] as { plan: string; interval: string; amount: number; currency: string }[] },
  toastError: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "u1", name: "Ada", email: "ada@example.test" } } }),
    useActiveOrganization: () => ({
      data: { id: "org-1", members: [{ userId: "u1", role: "owner" }] },
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
    useBillingState: () => ({ data: undefined }),
    useEntitlements: () => ({ data: { plan: "FREE" } }),
    useDexpayPlans: () => ({ data: state.plans }),
    DexpayCheckoutDialog: ({ price }: { price: { usdAmount: number } | null }) =>
      price ? <div role="dialog">Dexpay checkout for ${price.usdAmount}</div> : null,
  };
});

import { PricingSection } from "./pricing-section";

describe("PricingSection", () => {
  beforeEach(() => {
    toastError.mockClear();
    push.mockClear();
    state.plans = [];
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

    fireEvent.click(screen.getByRole("button", { name: /Start 14-day trial/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Dexpay checkout for $204");
  });

  it("never falls back to another provider when Dexpay does not sell the plan", () => {
    render(<PricingSection />);

    fireEvent.click(screen.getByRole("button", { name: /Start 14-day trial/ }));

    expect(toastError).toHaveBeenCalledWith(expect.stringContaining("contact@mrvin100.de"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
