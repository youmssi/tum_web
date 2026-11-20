import { expect, test } from "@playwright/test";

import { signUpWithWorkspace } from "./fixtures";

test("a new user signs up, creates a workspace, a project and a task", async ({ page }) => {
  await signUpWithWorkspace(page);

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByText("No projects yet.")).toBeVisible();
  await page.getByRole("button", { name: "New project" }).first().click();
  await page.getByLabel("Project name").fill("Launch campaign");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByText('Project "Launch campaign" created.')).toBeVisible();

  await page.getByRole("link", { name: /Launch campaign/ }).click();
  await expect(page.getByRole("heading", { name: "Launch campaign" })).toBeVisible();

  await page.getByRole("tab", { name: "List" }).click();
  await page.getByRole("button", { name: "New task" }).first().click();
  await page.getByRole("dialog").getByLabel("Title").fill("Write the press release");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByText("Task created.")).toBeVisible();
  await expect(page.getByRole("row", { name: /Write the press release/ })).toContainText("To do");

  await page.getByRole("tab", { name: "Board" }).click();
  await expect(page.getByText("Write the press release")).toBeVisible();
});
