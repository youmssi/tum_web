import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Secret-pass-123";

export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

/** Signs up a new user, who is signed in straight away, and gives them their own workspace. */
export async function signUpWithWorkspace(page: Page, workspace = `Acme ${Date.now()}`) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  const confirmation = page.getByRole("heading", { name: "Check your email" });
  // Better Auth allows 3 sign-ups per 10 seconds from one address, which a run of tests exceeds;
  // wait the window out rather than loosening a limit that protects production.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole("button", { name: "Create account" }).click();
    try {
      await confirmation.waitFor({ timeout: 5_000 });
      break;
    } catch {
      await page.waitForTimeout(10_000);
    }
  }
  await expect(confirmation).toBeVisible();

  await page.goto("/workspaces");
  await page.getByRole("button", { name: "Create new" }).click();
  await page.getByLabel("Organisation name").fill(workspace);
  await page.getByRole("button", { name: "Create organisation" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "My Work" })).toBeVisible();
}
