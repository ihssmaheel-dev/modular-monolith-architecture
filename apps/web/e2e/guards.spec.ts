import { expect, test, type Page } from "@playwright/test";

async function registerAs(page: Page, email: string) {
  await page.goto("/auth");
  await page.getByRole("tab", { name: /sign up|register/i }).click();
  await page.locator("#reg-name").fill("Guard User");
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill("Password123!");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("authenticated visitors are sent away from authentication", async ({ page }) => {
  await registerAs(page, `guard-auth-${Date.now()}@example.test`);
  await page.goto("/auth");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("non-admin visitors are sent away from user management", async ({ page }) => {
  await registerAs(page, `guard-users-${Date.now()}@example.test`);
  await page.goto("/users");
  await expect(page).toHaveURL(/\/dashboard$/);
});
