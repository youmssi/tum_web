import { expect, test, type Page } from "@playwright/test";

import { signUpWithWorkspace } from "./fixtures";

// A real Dexpay payment cannot run unattended, so the browser's calls for prices and checkout are
// answered here. Everything up to the hand-off to Dexpay, and the way back, is the real app.
const DEXPAY_PAGE = "https://pay.dexpay.test/checkout/SUB-e2e";

const plans = [
  { plan: "PRO", interval: "MONTHLY", amount: 174000, currency: "GNF" },
  { plan: "PRO", interval: "YEARLY", amount: 1775000, currency: "GNF" },
  { plan: "ENTERPRISE", interval: "MONTHLY", amount: 861000, currency: "GNF" },
  { plan: "ENTERPRISE", interval: "YEARLY", amount: 8770000, currency: "GNF" },
];

async function stubDexpay(page: Page, checkout: (body: Record<string, unknown>) => object) {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/billing/dexpay/plans", (route) => route.fulfill({ json: plans }));
  await page.route("**/api/billing/dexpay/checkout", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    requests.push(body);
    const { status = 200, ...json } = checkout(body) as { status?: number };
    await route.fulfill({ status, contentType: "application/json", json });
  });
  await page.route(`${DEXPAY_PAGE}**`, (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Dexpay checkout</h1>" }),
  );
  return requests;
}

test("the first payment asks only for a phone number, then opens Dexpay", async ({ page }) => {
  await signUpWithWorkspace(page);
  const requests = await stubDexpay(page, (body) =>
    body.phone
      ? { paymentUrl: DEXPAY_PAGE }
      : { status: 422, code: "phone_required", title: "Phone number required" },
  );

  await page.goto("/pricing");
  await expect(page.getByText(/equivalent in Guinean francs \(GNF\)/)).toBeVisible();
  await page.getByRole("switch", { name: "Bill yearly" }).click();
  await page
    .getByRole("button", { name: /Start 14-day trial/ })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("$20 per month");
  await dialog.getByLabel("Phone number").fill("+224621234567");
  await dialog.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page).toHaveURL(DEXPAY_PAGE);
  expect(requests.at(-1)).toMatchObject({
    plan: "PRO",
    interval: "MONTHLY",
    name: "Ada Lovelace",
    phone: "+224621234567",
  });
});

test("a refused payment page shows Dexpay's reason", async ({ page }) => {
  await signUpWithWorkspace(page);
  await stubDexpay(page, () => ({
    status: 502,
    code: "dexpay_rejected",
    detail: "Checkout session quota exceeded",
  }));

  await page.goto("/pricing");
  await page
    .getByRole("button", { name: /Start 14-day trial/ })
    .first()
    .click();

  await expect(
    page.getByText("Dexpay could not open the payment page: Checkout session quota exceeded"),
  ).toBeVisible();
});

test("returning from a failed payment explains that the plan has not changed", async ({ page }) => {
  await signUpWithWorkspace(page);

  await page.goto("/billing?payment=failed");

  await expect(page.getByRole("alert")).toContainText("The payment was not completed");
  await expect(
    page.getByText("You are on the Free plan").or(page.getByRole("link", { name: /View plans/ })),
  ).toBeVisible();
});
