import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a full local stack: Postgres, the Spring backend on :8080 and this
// app on :3000 (see e2e/README.md). They drive real browsers through real sign-up, workspace,
// project and task flows; only the payment provider is stubbed, since a real payment cannot run
// unattended.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
