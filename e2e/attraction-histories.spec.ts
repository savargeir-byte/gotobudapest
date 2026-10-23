import { expect, test } from "@playwright/test";
import { historySeedsA } from "../lib/attraction-history-batch-a";
import { historySeedsB } from "../lib/attraction-history-batch-b";

/**
 * Every newly authored history must render at the exact existing attraction
 * route, complete with headings, source links and nonempty text.
 */
for (const record of [...historySeedsA, ...historySeedsB]) {
  test(`History renders: ${record.slug}`, async ({ page }) => {
    const response = await page.goto(`/attractions/${record.slug}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    const article = page.locator(".attraction-history");
    await expect(article.locator("h2#place-history")).toBeVisible();
    await expect(article.locator(".attraction-history-section")).toHaveCount(2);
    await expect(article.locator(".attraction-history-sources a").first()).toHaveAttribute(
      "href",
      /^https:\/\//,
    );
    await expect(article.locator(".attraction-history-lead")).toContainText(/.{20,}/);
  });
}
