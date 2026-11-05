import { expect, test } from "@playwright/test";

test.describe("Consent-first Google Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({
      status: 200, contentType: "application/javascript", body: "/* GA4 stub for consent test */",
    }));
    await page.route("https://www.google-analytics.com/**", (route) => route.abort());
  });

  test("does not load GA4 until visitor opts in, remembers rejection", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("cookie-consent")).toBeVisible();
    await expect(page.locator('script[data-gtb-analytics="true"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Reject optional" }).click();
    await expect(page.getByTestId("cookie-consent")).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("cookie-consent")).toHaveCount(0);
    await expect(page.locator('script[data-gtb-analytics="true"]')).toHaveCount(0);
  });

  test("loads exactly one Google tag after affirmative consent and allows withdrawal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("cookie-consent")).toBeVisible();
    await page.getByRole("button", { name: "Manage preferences" }).click();
    await page.getByRole("checkbox", { name: /optional analytics/i }).check();
    await page.getByRole("button", { name: "Save choices" }).click();
    await expect(page.locator('script[data-gtb-analytics="true"]')).toHaveCount(1);
    await page.reload();
    await expect(page.locator('script[data-gtb-analytics="true"]')).toHaveCount(1);
    await page.getByRole("button", { name: "Cookie settings" }).click();
    await page.getByRole("button", { name: "Reject optional" }).click();
    await expect(page.locator('script[data-gtb-analytics="true"]')).toHaveCount(0);
    await expect(page.getByTestId("cookie-consent")).toHaveCount(0);
  });
});
