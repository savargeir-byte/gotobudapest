import { expect, test } from "@playwright/test";

const editorialRoutes: Record<string, number> = {
  "/guides/budapest-in-3-days": 4,
  "/guides/budapest-thermal-baths": 4,
  "/guides/getting-around-budapest": 3,
  "/guides/buda-castle-district": 4,
  "/guides/danube-cruises": 3,
  "/guides/budapest-bars-nightlife": 4,
  "/experiences/danube": 4,
  "/experiences/thermal-baths": 3,
  "/experiences/food-and-markets": 3,
  "/neighbourhoods/castle-district": 4,
  "/neighbourhoods/downtown-pest": 4,
};

for (const [url, count] of Object.entries(editorialRoutes)) {
  test(`editorial photography: ${url}`, async ({ page }) => {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const photos = page.locator("figure.editorial-inline-photo");
    await expect(photos).toHaveCount(count);
    for (let i = 0; i < count; i++) {
      const figure = photos.nth(i);
      const image = figure.locator("img");
      await expect(image).toHaveAttribute("alt", /.+/);
      await expect(figure.locator("figcaption")).toContainText("Wikimedia Commons");
      await expect(image).toHaveAttribute("src", /\/assets\/photos\//);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "horizontal overflow in pixels").toBeLessThanOrEqual(1);
  });
}
