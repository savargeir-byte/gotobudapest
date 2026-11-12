import { expect, test } from "@playwright/test";

test("home has a prominent bookable-tours section before editorial attractions", async ({ page }) => {
  await page.goto("/");
  const tours = page.locator("#bookable-tours");
  const attractions = page.locator("#explore");
  await expect(tours.getByRole("heading", { name: /book your budapest experience/i })).toBeVisible();
  await expect(tours.getByRole("link", { name: /view all tours/i })).toHaveAttribute("href", "/tours");
  await expect(tours.getByRole("link", { name: /danube cruises/i })).toHaveAttribute("href", "/tours?category=cruises");
  await expect(tours.getByRole("link", { name: /thermal baths/i })).toHaveAttribute("href", "/tours?category=baths");
  const order = await page.evaluate(() => {
    const tours = document.querySelector("#bookable-tours");
    const explore = document.querySelector("#explore");
    return Boolean(tours && explore && (tours.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(order).toBe(true);

  // Server-streamed live inventory may be temporarily unavailable in CI
  // without supplier keys. Never silently hide the entire commerce section.
  await expect(tours.locator(".home-tour-grid, .home-tour-unavailable")).toBeVisible();
  const cards = tours.locator("[data-product]");
  expect(await cards.count()).toBeLessThanOrEqual(6);
  if ((await cards.count()) > 0) {
    await expect(cards.first().getByRole("link", { name: /check availability/i })).toHaveAttribute("href", /^\/tours\//);
  }
});
