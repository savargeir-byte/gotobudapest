// Browser tests against the local mock Viator API. No live bookings are initiated.
import { expect, test, type Page } from "@playwright/test";

const MOCK = `http://127.0.0.1:${process.env.MOCK_PROVIDER_PORT || 3900}`;
const productCode = (prefix: string) => prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
const productUrl = (code: string) =>
  `https://www.viator.com/tours/Budapest/Mock-Danube-Cruise/d684-${code}?pid=P00MOCK&mcid=42383&medium=api&medium_version=2.0&uid=U-MOCK&target_lander=NONE`;

async function prepare(page: Page) {
  const errors: string[] = [];
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) =>
      route.request().resourceType() === "image"
        ? route.fulfill({
            status: 200,
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"></svg>',
          })
        : route.abort(),
  );
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function logOf(code: string): Promise<{ method: string; path: string }[]> {
  return (await fetch(`${MOCK}/__log/${code}`)).json();
}

test.describe("Viator product: direct affiliate handoff", () => {
  test("a marketplace card opens the informational product, with a one-click provider link", async ({ page }) => {
    const errors = await prepare(page);
    await page.goto("/tours?provider=viator");
    const card = page.locator('.mk-card[data-provider="viator"]').first();
    await expect(card).toBeVisible();
    const code = (await card.getAttribute("data-product"))!.split(":")[1];
    await card.getByRole("link", { name: /View details/ }).click();
    await expect(page).toHaveURL(new RegExp(`/tours/viator/${code}$`));
    await expect(page.getByRole("heading", { name: "About this experience" })).toBeVisible();
    await expect(page.locator("#availability-heading")).toHaveText("Book this tour on Viator");
    await expect(page.locator("#availability")).toContainText("choose your date, number of guests and tour option");
    const links = page.locator('main a[href*="viator.com"]');
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("href", productUrl(code));
      await expect(link).toHaveAttribute("rel", "sponsored noopener noreferrer");
      await expect(link).toHaveAttribute("target", "_blank");
    }
    expect(errors).toEqual([]);
  });

  test("removes redundant date, travellers, availability form and transactional calls", async ({ page }) => {
    await prepare(page);
    const code = productCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    await expect(page.locator(".booking-date-trigger")).toHaveCount(0);
    await expect(page.locator(".booking-stepper")).toHaveCount(0);
    await expect(page.locator(".vp-results")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Check availability" })).toHaveCount(0);
    await expect(page.locator("#availability .primary")).toHaveAttribute("href", productUrl(code));
    const calls = await logOf(code);
    expect(calls.map((c) => c.path)).toEqual([`products/${code}`]);
    expect(calls.some((c) => /bookings|reserve|hold|cart|payment/.test(c.path))).toBe(false);
  });

  test("preserves provider-supplied product details and does not manufacture sections", async ({ page }) => {
    await prepare(page);
    await page.goto(`/tours/viator/${productCode("VOK")}`);
    await expect(page.locator(".vp-rating")).toContainText("4.6");
    await expect(page.locator(".vp-details")).toContainText("Second paragraph about the Danube evening cruise.");
    await expect(page.getByRole("heading", { name: "Highlights" })).toBeVisible();
    await expect(page.locator(".vp-details")).toContainText("Meet at the Vigado pier");
    await expect(page.locator(".vp-details")).toContainText("Welcome drink");
    await expect(page.getByRole("heading", { name: "Cancellation policy" })).toBeVisible();
    await expect(page.locator(".vp-gallery-main img")).toBeVisible();

    const noImages = productCode("VNOIMG");
    await page.goto(`/tours/viator/${noImages}`);
    await expect(page.locator(".vp-gallery-main img")).toHaveCount(0);
    await expect(page.locator("#availability .primary")).toHaveAttribute("href", productUrl(noImages));
  });

  test("mobile sticky CTA opens the exact tour, without overlapping or horizontal overflow", async ({ page }) => {
    await prepare(page);
    const code = productCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    const sticky = page.locator(".vp-sticky");
    if ((page.viewportSize()?.width ?? 1400) <= 900) {
      await expect(sticky).toBeVisible();
      await expect(sticky.getByRole("link", { name: /Book on Viator/ })).toHaveAttribute("href", productUrl(code));
      await expect(sticky.getByRole("link", { name: /Book on Viator/ })).toHaveAttribute("target", "_blank");
    } else {
      await expect(sticky).toBeHidden();
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const a = await page.locator(".vp-details").boundingBox();
    const b = await page.locator("#availability").boundingBox();
    if (a && b) expect(a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height).toBe(false);
  });

  test("products outside Budapest return 404, rather than a generic provider page", async ({ page }) => {
    await prepare(page);
    const response = await page.goto(`/tours/viator/${productCode("VFOR")}`);
    expect(response?.status()).toBe(404);
  });
});
