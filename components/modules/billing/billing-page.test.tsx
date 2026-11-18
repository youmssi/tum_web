import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";
import type { DexpaySubscription } from "./dexpay-api";

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  subscription: null as DexpaySubscription | null,
  role: "owner",
  cancel: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "u1" } } }),
    useActiveOrganization: () => ({
      data: { id: "org-1", members: [{ userId: "u1", role: state.role }] },
    }),
  },
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => state.params }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("./use-dexpay", () => ({
  useDexpaySubscription: () => ({ data: state.subscription, isLoading: false, isError: false }),
  useCancelDexpaySubscription: () => ({ mutate: state.cancel, isPending: false }),
}));

import { BillingPage } from "./billing-page";

const active: DexpaySubscription = {
  plan: "PRO",
  status: "ACTIVE",
  currentPeriodEnd: "2027-01-15T00:00:00Z",
  cancelAtPeriodEnd: false,
};

describe("BillingPage", () => {
  beforeEach(() => {
    state.subscription = null;
    state.params = new URLSearchParams();
    state.role = "owner";
    state.cancel.mockClear();
  });

  it("offers the plans to a workspace on the free plan", () => {
    render(<BillingPage />);

    expect(screen.getByText("You're on the free plan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View plans/ })).toHaveAttribute("href", "/pricing");
  });

  it("shows the Dexpay plan and its renewal date, with no other provider", () => {
    state.subscription = active;
    render(<BillingPage />);

    expect(screen.getByText("Pro plan")).toBeInTheDocument();
    expect(screen.getByText("Renews on")).toBeInTheDocument();
    expect(screen.getByText("January 15, 2027")).toBeInTheDocument();
    expect(screen.getByText(/Paid through Dexpay/)).toBeInTheDocument();
    expect(screen.queryByText(/portal|Polar/i)).not.toBeInTheDocument();
  });

  it("cancels after the owner confirms", async () => {
    state.subscription = active;
    render(<BillingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
    expect(await screen.findByText("Cancel the Pro plan?")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel subscription" }).at(-1)!);

    await waitFor(() => expect(state.cancel).toHaveBeenCalledTimes(1));
  });

  it("shows when a cancelled plan ends and no longer offers to cancel", () => {
    state.subscription = { ...active, cancelAtPeriodEnd: true };
    render(<BillingPage />);

    expect(screen.getByText("Ends on")).toBeInTheDocument();
    expect(screen.getByText(/Renewals are stopped/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel subscription" })).not.toBeInTheDocument();
  });

  it("lets only an owner or admin change the plan", () => {
    state.subscription = active;
    state.role = "member";
    render(<BillingPage />);

    expect(screen.getByText(/Only the workspace owner or an admin/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Change plan" })).not.toBeInTheDocument();
  });

  it("explains a payment that did not go through", () => {
    state.params = new URLSearchParams("payment=failed");
    render(<BillingPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("The payment was not completed");
  });
});
