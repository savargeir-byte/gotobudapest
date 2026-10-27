import { expect, test } from "@playwright/test";

// MOCKED: the editorial rows ask the marketplace API (browser fetch, intercepted here).
// Every card links to a GoToBudapest product page; provider URLs never appear on a card.
const product = (over: Record<string, unknown>) => ({
  categories: [], bookingUrl: "https://www.viator.com/tours/Budapest/Viator123?campaign-value=gotobudapest", ...over,
});
const items = [
  product({
    id: "viator:Viator123", provider: "viator", providerKey: "Viator123", title: "Hospital in the Rock Guided Tour",
    detailUrl: "/tours/viator/Viator123", price: { amount: 45, currency: "EUR", label: "From €45" },
  }),
  product({
    id: "tiqets:991", provider: "tiqets", providerKey: "991", title: "Budapest Thermal Bath Admission",
    detailUrl: "/tours/tiqets/991", bookingUrl: "https://www.tiqets.com/en/budapest/?partner=test",
  }),
];
const providers = {
  viator: { status: "ok", count: 2 }, tiqets: { status: "ok", count: 0 }, tourdesk: { status: "disabled", count: 0 },
};

test("Tours landing page renders the marketplace and invents no offers", async ({ page }) => {
  const response = await page.goto("/tours");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Budapest tours & tickets." })).toBeVisible();
  await expect(page.getByRole("searchbox").first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Tour categories" })).toBeVisible();
  // No offers exist without provider keys on this server: nothing is made up.
  await expect(page.locator(".offer-card")).toHaveCount(0);
});

test("Attraction detail shows only genuinely matching products, internal links only", async ({ page }) => {
  await page.route("**/api/marketplace/search?*", async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get("q")).toContain("Hospital in the Rock");
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ items, providers }) });
  });
  await page.goto("/attractions/hospital-in-the-rock");
  const row = page.getByTestId("contextual-tours");
  await row.scrollIntoViewIfNeeded();
  // The thermal-bath product does not mention the attraction, so only one card remains.
  await expect(row.locator(".mk-card")).toHaveCount(1);
  await expect(row.locator(".mk-card a")).toHaveAttribute("href", "/tours/viator/Viator123");
  await expect(row.locator('a[href^="http"]')).toHaveCount(0);
  await expect(page.locator(".attraction-history")).toBeVisible();
});

test("No invented offers when the partners have none", async ({ page }) => {
  await page.route("**/api/marketplace/search?*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ items: [], providers }) }),
  );
  await page.goto("/experiences/danube");
  const row = page.getByTestId("contextual-tours");
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.locator(".mk-card")).toHaveCount(0);
  await expect(row.locator("section")).toHaveCount(0);
});

test("The header links to a real tours page with no Trip Planner", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  if (await menu.isVisible()) await menu.click();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const tours = nav.getByRole("link", { name: "Tours & Tickets" });
  await expect(tours).toHaveAttribute("href", "/tours");
  await expect(nav).not.toContainText("My Trip");
});

test("Unrecognized public API contexts cannot trigger API searches", async ({ request }) => {
  const response = await request.get("/api/budapest-offers?kind=attraction&slug=unknown-123");
  expect(response.status()).toBe(400);
  const body = await response.text();
  expect(body).not.toMatch(/(VIATOR_API_KEY|TOURDESK_API_KEY|TIQETS_API_KEY)/);
});
