import { expect, test } from "@playwright/test";

const mockedOffers = [
  {
    id: "tourdesk:7-2", provider: "TourDesk", title: "Budapest Danube River Cruise",
    description: "A river cruise in Budapest with a local operator.",
    bookingUrl: "https://checkout.tourdesk.is/budapest/7-2",
    currency: "EUR", amount: 32,
    photo: "https://images.example.com/a.jpg",
  },
  {
    id: "viator:Viator123", provider: "Viator", title: "Budapest Castle Walking Tour",
    description: "Walk the old streets of Castle Hill with a guide.",
    bookingUrl: "https://www.viator.com/tours/Budapest/Viator123?campaign-value=gotobudapest",
    priceLabel: "€45",
  },
  {
    id: "tiqets:991", provider: "Tiqets", title: "Budapest Thermal Bath Admission",
    bookingUrl: "https://www.tiqets.com/en/budapest/?partner=test", amount: 28, currency: "EUR",
  },
];

test("Tours landing page shows only partner-supplied booking URLs", async ({ page }) => {
  await page.route("**/api/budapest-offers?*", async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get("kind")).toBe("popular");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ offers: mockedOffers }) });
  });
  const response = await page.goto("/tours");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Budapest tours & tickets." })).toBeVisible();
  await page.locator("#bookable-tours").scrollIntoViewIfNeeded();
  await expect(page.locator(".offer-card")).toHaveCount(3);
  const hrefs = await page.locator(".offer-card-bottom a").evaluateAll((links) =>
    links.map((element) => element.getAttribute("href")),
  );
  expect(hrefs).toEqual(mockedOffers.map((item) => item.bookingUrl));
  await expect(page.locator(".offer-card")).toContainText(["TourDesk", "Viator", "Tiqets"]);
  await expect(page.locator(".offer-disclaimer")).toContainText("Booking and payment");
});

test("Attraction detail matches only its approved slug", async ({ page }) => {
  await page.route("**/api/budapest-offers?*", async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get("kind")).toBe("attraction");
    expect(url.searchParams.get("slug")).toBe("hospital-in-the-rock");
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ offers: [mockedOffers[1]] }) });
  });
  await page.goto("/attractions/hospital-in-the-rock");
  await page.locator(".offer-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".offer-card")).toHaveCount(1);
  await expect(page.locator(".attraction-history")).toBeVisible();
});

test("No invented offers when the partners have none", async ({ page }) => {
  await page.route("**/api/budapest-offers?*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ offers: [] }) }),
  );
  await page.goto("/experiences/danube");
  await page.locator(".offer-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".offer-card")).toHaveCount(0);
  await expect(page.locator(".offer-progress")).toContainText("No verified bookable offers");
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
