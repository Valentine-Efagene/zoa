import { expect, type Page } from "@playwright/test";

export async function signInViaUi(
  page: Page,
  email = "uat@zoa.test",
  password = "password",
) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("Welcome back")).toBeVisible();
}
