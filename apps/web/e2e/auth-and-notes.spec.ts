import { expect, test } from "@playwright/test";

test("signed-out visitors are sent to authentication", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole("tab", { name: /sign up|register/i })).toBeVisible();
});

test("a new user can register, create a note, and sign out", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.test`;
  await page.goto("/auth");
  await page.getByRole("tab", { name: /sign up|register/i }).click();
  await page.locator("#reg-name").fill("E2E User");
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill("Password123!");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/notes/new");
  await page.getByLabel(/title/i).fill("E2E note");
  await page.getByLabel(/content/i).fill("Created through the browser flow.");
  await page.getByRole("button", { name: /create note/i }).click();

  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText("E2E note")).toBeVisible();
  await page.getByRole("button", { name: /profile/i }).click();
  await page.getByRole("menuitem", { name: /sign out|logout/i }).click();
  await expect(page).toHaveURL(/\/auth$/);
});

test("forgot-password does not reveal account existence", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("link", { name: /forgot password/i }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  await page.locator("#forgot-email").fill("unknown@example.test");
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(page.getByText(/check|sent|email/i)).toBeVisible();
});
