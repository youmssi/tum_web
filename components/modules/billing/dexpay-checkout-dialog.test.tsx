import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";
import { ApiError } from "@/lib/api-error";
import type { DexpayCheckoutInput, DexpayPlanPrice } from "./dexpay-api";
import { DexpayCheckoutDialog } from "./dexpay-checkout-dialog";

// A plain holder rather than vi.fn(): Vitest reports a rejected promise returned by a mock as a
// test error, which would fail the refusal cases even though the dialog handles them.
const dexpay = vi.hoisted(() => ({
  calls: [] as unknown[],
  respond: (): Promise<{ paymentUrl: string }> => Promise.resolve({ paymentUrl: "" }),
}));

vi.mock("./dexpay-api", () => ({
  dexpayApi: {
    startCheckout: (input: DexpayCheckoutInput) => {
      dexpay.calls.push(input);
      return dexpay.respond();
    },
  },
}));

const price: DexpayPlanPrice = { plan: "PRO", interval: "MONTHLY", amount: 12000, currency: "XAF" };
const assign = vi.fn();

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DexpayCheckoutDialog
        price={price}
        defaultName="Ada Owner"
        defaultEmail="ada@example.test"
        onClose={() => {}}
      />
    </QueryClientProvider>,
  );
}

describe("DexpayCheckoutDialog", () => {
  beforeEach(() => {
    dexpay.calls.length = 0;
    assign.mockClear();
    vi.stubGlobal("location", { ...window.location, assign });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("shows the local price and prefills the billing contact", () => {
    renderDialog();

    expect(screen.getByText(/XAF\s12,000 per month/)).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Ada Owner");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.test");
  });

  it("refuses a phone number that is not in international format", async () => {
    renderDialog();

    await userEvent.type(screen.getByLabelText("Phone number"), "650000000");
    await userEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByText(/Use the international format/)).toBeInTheDocument();
    expect(dexpay.calls).toHaveLength(0);
  });

  it("starts the checkout and sends the buyer to the payment page", async () => {
    dexpay.respond = () => Promise.resolve({ paymentUrl: "https://pay.example.test/sub-1" });
    renderDialog();

    await userEvent.type(screen.getByLabelText("Phone number"), "+237650000000");
    await userEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://pay.example.test/sub-1"));
    expect(dexpay.calls).toEqual([
      {
        plan: "PRO",
        interval: "MONTHLY",
        name: "Ada Owner",
        email: "ada@example.test",
        phone: "+237650000000",
      },
    ]);
  });

  it("explains that only an owner or admin can subscribe when the backend refuses", async () => {
    dexpay.respond = () => Promise.reject(new ApiError(403, { title: "Forbidden" }));
    renderDialog();

    await userEvent.type(screen.getByLabelText("Phone number"), "+237650000000");
    await userEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Only a workspace owner or admin can subscribe.",
    );
    expect(assign).not.toHaveBeenCalled();
  });
});
