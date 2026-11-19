import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl as render } from "@/components/modules/auth/test-utils";
import { ApiError } from "@/lib/api-error";
import type { DexpayCheckoutInput } from "./dexpay-api";
import { DexpayCheckoutDialog, type DexpayCheckoutOption } from "./dexpay-checkout-dialog";

// A plain holder rather than vi.fn(): Vitest reports a rejected promise returned by a mock as a
// test error, which would fail the refusal cases even though the dialog handles them.
type Respond = (input: DexpayCheckoutInput) => Promise<{ paymentUrl: string }>;
const dexpay = vi.hoisted(() => ({
  calls: [] as DexpayCheckoutInput[],
  respond: (() => Promise.resolve({ paymentUrl: "" })) as Respond,
}));
const toastError = vi.hoisted(() => vi.fn());

vi.mock("./dexpay-api", () => ({
  dexpayApi: {
    startCheckout: (input: DexpayCheckoutInput) => {
      dexpay.calls.push(input);
      return dexpay.respond(input);
    },
  },
}));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const price: DexpayCheckoutOption = { plan: "PRO", interval: "MONTHLY", usdAmount: 20 };
const assign = vi.fn();
const onClose = vi.fn();

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DexpayCheckoutDialog
        price={price}
        name="Ada Owner"
        email="ada@example.test"
        onClose={onClose}
      />
    </QueryClientProvider>,
  );
}

const phoneRequired = () =>
  Promise.reject(new ApiError(422, { status: 422, code: "phone_required" }));

describe("DexpayCheckoutDialog", () => {
  beforeEach(() => {
    dexpay.calls.length = 0;
    assign.mockClear();
    onClose.mockClear();
    toastError.mockClear();
    vi.stubGlobal("location", { ...window.location, assign });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("goes straight to Dexpay with the account's name and email when no phone is needed", async () => {
    dexpay.respond = () => Promise.resolve({ paymentUrl: "https://pay.example.test/sub-1" });
    renderDialog();

    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://pay.example.test/sub-1"));
    expect(dexpay.calls).toEqual([
      { plan: "PRO", interval: "MONTHLY", name: "Ada Owner", email: "ada@example.test" },
    ]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks only for the phone number on the workspace's first payment", async () => {
    dexpay.respond = (input) =>
      input.phone
        ? Promise.resolve({ paymentUrl: "https://pay.example.test/sub-2" })
        : phoneRequired();
    renderDialog();

    expect(await screen.findByRole("dialog")).toHaveTextContent(/\$20 per month/);
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Phone number"), "+224621234567");
    await userEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://pay.example.test/sub-2"));
    expect(dexpay.calls.at(-1)).toEqual({
      plan: "PRO",
      interval: "MONTHLY",
      name: "Ada Owner",
      email: "ada@example.test",
      phone: "+224621234567",
    });
  });

  it("refuses a phone number that is not in international format", async () => {
    dexpay.respond = phoneRequired;
    renderDialog();

    await userEvent.type(await screen.findByLabelText("Phone number"), "621234567");
    await userEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByText(/Use the international format/)).toBeInTheDocument();
    expect(dexpay.calls).toHaveLength(1);
  });

  it("reports a refusal without opening a form", async () => {
    dexpay.respond = () => Promise.reject(new ApiError(403, { status: 403 }));
    renderDialog();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/owner or admin/)),
    );
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Dexpay's reason when it refuses to open the payment page", async () => {
    dexpay.respond = () =>
      Promise.reject(
        new ApiError(502, {
          status: 502,
          code: "dexpay_rejected",
          detail: "Checkout session quota exceeded",
        }),
      );
    renderDialog();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Dexpay could not open the payment page: Checkout session quota exceeded",
      ),
    );
  });

  it("asks to retry later when the payment service is too slow", async () => {
    dexpay.respond = () =>
      Promise.reject(new ApiError(502, { status: 502, code: "dexpay_unreachable" }));
    renderDialog();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/took too long/)),
    );
  });
});
