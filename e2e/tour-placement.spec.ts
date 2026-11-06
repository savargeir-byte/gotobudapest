import { expect, test, type Page } from "@playwright/test";

// Placement of bookable tours and the homepage weather banner. The marketplace and weather APIs are intercepted: no
// provider or weather service is contacted and no product, price or forecast is invented by these tests.
const providers = { viator: { status: "ok", count: 1 }, tiqets: { status: "ok", count: 0 }, tourdesk: { status: "disabled", count: 0 } };
const product = (over: Record<string, unknown>) => ({
  categories: [], bookingUrl: "https://www.viator.com/tours/Budapest/Test-Tour/d100-1P1?campaign-value=gotobudapest", ...over,
});

async function mockCategory(page: Page, category: string, items: unknown[]) {
  await page.route("**/api/marketplace/search?*", (route) => {
    const q = new URL(route.request().url()).searchParams;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ items: q.get("category") === category ? items : [], providers }),
    });
  });
}

test("attraction page: ONE tour row, in the right-hand column on desktop and in the reading flow on phones", async ({ page, isMobile }) => {
  await mockCategory(page, "baths", [
    product({ id: "viator:B1", provider: "viator", providerKey: "B1", title: "Budapest Thermal Bath Day Pass", detailUrl: "/tours/viator/B1" }),
  ]);
  await page.goto("/attractions/lukacs-thermal-bath");
  const rail = page.locator("aside.attraction-booking-rail");
  await expect(rail).toHaveCount(1);
  await expect(page.getByTestId("contextual-tours")).toHaveCount(1);
  await rail.scrollIntoViewIfNeeded();
  await expect(rail.locator(".mk-card")).toHaveCount(1);
  await expect(rail.getByRole("link", { name: /Check availability/ })).toHaveAttribute("href", "/tours/viator/B1");
  const article = page.locator(".detail-panel.article-body").first();
  const railBox = (await rail.boundingBox())!;
  const articleBox = (await article.boundingBox())!;
  if (isMobile) {
    // single column: the rail comes before the facts and long text, not after everything
    expect(railBox.y).toBeLessThan(articleBox.y);
    expect(railBox.x).toBeLessThan(40);
  } else {
    // wide screen: beside the article, in the otherwise empty right-hand space
    expect(railBox.x).toBeGreaterThan(articleBox.x + articleBox.width - 4);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("attraction page: when the partners list nothing the rail is never a blank column and nothing is invented", async ({ page }) => {
  await page.route("**/api/marketplace/search?*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ items: [], providers }) }),
  );
  await page.goto("/attractions/great-market-hall");
  const rail = page.locator("aside.attraction-booking-rail");
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await expect(page.locator(".mk-card")).toHaveCount(0);
  await expect(rail).toBeVisible();
  await expect(rail).toContainText(/keep exploring/i);
  await expect(rail.getByRole("link", { name: /All Budapest attractions/ })).toBeVisible();
  expect((await rail.boundingBox())!.height).toBeGreaterThan(60);
});

test("the lazy tour wrapper stays observable inside the rail (never display:none before it loads)", async ({ page }) => {
  await mockCategory(page, "baths", [
    product({ id: "viator:B2", provider: "viator", providerKey: "B2", title: "Thermal Bath Entry", detailUrl: "/tours/viator/B2" }),
  ]);
  await page.goto("/attractions/gellert-thermal-bath");
  const wrapper = page.getByTestId("contextual-tours");
  expect(await wrapper.evaluate((el) => getComputedStyle(el).display)).not.toBe("none");
  await wrapper.scrollIntoViewIfNeeded();
  await expect(wrapper.locator(".mk-card").first()).toBeVisible();
});

test("attraction pages link back to the visitor guides that mention them", async ({ page }) => {
  const cases: [string, string][] = [
    ["/attractions/memento-park", "/visit/budapest-day-trips"],
    ["/attractions/godollo-royal-palace", "/visit/budapest-day-trips"],
    ["/attractions/szimpla-kert", "/gastronomy/bars-and-nightlife"],
  ];
  for (const [from, to] of cases) {
    await page.goto(from);
    await expect(page.getByTestId("visitor-guides-for-place").locator(`a[href="${to}"]`), from).toBeVisible();
  }
});

test("homepage weather banner shows the live forecast fields and links to suitable activities", async ({ page }) => {
  await page.route("**/api/weather/budapest", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ city: "Budapest", date: "2026-11-06", current: 12, max: 14, min: 4, code: 61, isDay: true, sunset: null, source: "Open-Meteo", updated: null }),
    }),
  );
  let geolocationAsked = false;
  await page.exposeFunction("__geoAsked", () => { geolocationAsked = true; });
  await page.addInitScript(() => {
    const g = navigator.geolocation;
    if (g) {
      const ask = () => (window as unknown as { __geoAsked: () => void }).__geoAsked();
      g.getCurrentPosition = ((...a: unknown[]) => { ask(); return (a as never[]); }) as never;
      g.watchPosition = (() => { ask(); return 0; }) as never;
    }
  });
  await page.goto("/");
  const banner = page.locator("section.budapest-weather-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Rain");
  await expect(banner).toContainText("14° high / 4° low");
  await expect(banner.locator(".budapest-weather-current")).toContainText("12°");
  await expect(banner.getByRole("link", { name: /Open-Meteo/ })).toHaveAttribute("href", "https://open-meteo.com/");
  // rain: the indoor suggestion comes first
  const links = await banner.locator(".budapest-weather-actions a.textlink").allTextContents();
  expect(links[0]).toMatch(/Thermal baths/);
  expect(geolocationAsked, "the visitor's location is never requested").toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("homepage weather banner: an unavailable forecast shows a plain note, not a stale or invented number", async ({ page }) => {
  await page.route("**/api/weather/budapest", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Weather unavailable" }) }));
  await page.goto("/");
  const banner = page.locator("section.budapest-weather-banner");
  await expect(banner).toContainText("forecast is unavailable right now");
  await expect(banner.locator(".budapest-weather-current")).toHaveCount(0);
  await expect(banner.getByRole("link", { name: /Explore the Danube/ })).toBeVisible();
});

test("the weather API answers from the real Open-Meteo forecast with a cache header, or 503 without a number", async ({ request }) => {
  const res = await request.get("/api/weather/budapest");
  if (res.status() === 200) {
    const body = await res.json();
    expect(Number.isFinite(body.current)).toBe(true);
    expect(body.max).toBeGreaterThanOrEqual(body.min);
    expect(body.source).toBe("Open-Meteo");
    expect(res.headers()["cache-control"]).toContain("s-maxage=1800");
  } else {
    expect(res.status()).toBe(503);
    expect(res.headers()["cache-control"]).toContain("no-store");
  }
});
