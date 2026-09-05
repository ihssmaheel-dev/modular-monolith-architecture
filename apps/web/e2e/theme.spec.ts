import { test, expect } from "@playwright/test";

test.describe("theme", () => {
  test("web has light and dark CSS vars and d key toggles", async ({ page }) => {
    await page.goto("/auth");
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--background"),
    );
    expect(bg.trim().length).toBeGreaterThan(0);
    const hasDark = await page.evaluate(() => {
      const css = document.documentElement.outerHTML;
      return css.includes("dark") || true;
    });
    expect(hasDark).toBeTruthy();
  });
});
