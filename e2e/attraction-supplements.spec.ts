import { expect, test } from "@playwright/test";

// The three places added after the Sanity migration (lib/attraction-supplements.ts), the "Nearby places" section, and the
// wider-category tour row. The marketplace API is intercepted: no provider is contacted and no product is invented.
const PLACES = [
  { slug: "memento-park", name: "Memento Park", credit: /Pudelek/, history: "From removal to open-air museum" },
  { slug: "godollo-royal-palace", name: "Royal Palace of Gödöllő", credit: /Rlevente/, history: "A royal residence" },
  { slug: "szimpla-kert", name: "Szimpla Kert", credit: /Nan Palmero/, history: "From a first pub to Kazinczy Street" },
];

for (const p of PLACES) {
  test(`${p.name}: a complete page with photo credit, history, sources and canonical URL`, async ({ page }) => {
    const res = await page.goto(`/attractions/${p.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: p.name })).toBeVisible();
    await expect(page.locator("figure.article-hero img")).toBeVisible();
    await expect(page.locator("figure.article-hero figcaption")).toContainText(p.credit);
    await expect(page.getByRole("heading", { name: `History of ${p.name}` })).toBeVisible();
    await expect(page.getByRole("heading", { name: p.history })).toBeVisible();
    await expect(page.getByRole("heading", { name: `About ${p.name}` })).toBeVisible();
    await expect(page.locator("main")).toContainText("Facts checked against these sources");
    await expect(page.locator(".attraction-history-sources a").first()).toHaveAttribute("href", /^https:\/\//);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(new RegExp(`/attractions/${p.slug}$`));
    expect(await page.locator("title").textContent()).toBeTruthy();
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toMatch(/.{80,}/);
    const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || "{}")));
    const place = ld.find((d) => d["@type"] === "TouristAttraction");
    expect(place?.name).toBe(p.name);
    expect(place?.url).toMatch(new RegExp(`/attractions/${p.slug}$`));
    expect(place?.geo?.latitude).toBeGreaterThan(47);
    // No page overflows sideways on a phone.
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("Gödöllő shows the operator's renovation notice; the other new pages do not", async ({ page }) => {
  await page.goto("/attractions/godollo-royal-palace");
  await expect(page.locator(".status-note")).toContainText("rehabilitation programme");
  await page.goto("/attractions/memento-park");
  await expect(page.locator(".status-note")).toHaveCount(0);
});

test("the new places are found in the directory (and its category filter) and are in the sitemap", async ({ page, request }) => {
  await page.goto("/attractions");
  const search = page.getByLabel(/^Search \d+ places$/);
  for (const p of PLACES) {
    await search.fill(p.name);
    await expect(page.locator(`.cards a[href="/attractions/${p.slug}"]`).first()).toBeVisible();
  }
  await search.fill("");
  await page.getByRole("button", { name: "Nightlife" }).click();
  await expect(page.locator(".cards article")).toHaveCount(1);
  await expect(page.locator(".cards article")).toContainText("Szimpla Kert");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const p of PLACES) expect(sitemap).toContain(`/attractions/${p.slug}`);
});

test("Nearby places: Szimpla Kert lists its Jewish Quarter neighbours with rounded straight-line distances that resolve", async ({ page, request }) => {
  await page.goto("/attractions/szimpla-kert");
  const nearby = page.getByTestId("nearby-places");
  await expect(nearby).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nearby places" })).toBeVisible();
  const links = nearby.locator("a");
  expect(await links.count()).toBeGreaterThanOrEqual(2);
  expect(await links.count()).toBeLessThanOrEqual(4);
  for (const text of await links.allTextContents()) expect(text).toMatch(/· about (\d+ m|\d\.\d km) ↗$/);
  await expect(nearby.locator('a[href="/attractions/kazinczy-street-orthodox-synagogue"]')).toBeVisible();
  const first = await links.first().getAttribute("href");
  expect((await request.get(first!)).status()).toBe(200);
  await expect(page.locator("main")).toContainText("not walking routes");
});

test("Nearby places: a city-centre landmark has neighbours; a place on the city's edge shows none rather than a far one", async ({ page }) => {
  await page.goto("/attractions/chain-bridge");
  expect(await page.getByTestId("nearby-places").locator("a").count()).toBeGreaterThanOrEqual(2);
  await page.goto("/attractions/memento-park");
  await expect(page.getByTestId("nearby-places")).toHaveCount(0);
});

const product = (over: Record<string, unknown>) => ({
  categories: [], bookingUrl: "https://www.viator.com/tours/Budapest/Viator123?campaign-value=gotobudapest", ...over,
});
const providers = { viator: { status: "ok", count: 1 }, tiqets: { status: "ok", count: 0 }, tourdesk: { status: "disabled", count: 0 } };

test("an attraction with no product of its own gets a clearly labelled category row, with internal links only", async ({ page }) => {
  const asked: string[] = [];
  await page.route("**/api/marketplace/search?*", (route) => {
    const q = new URL(route.request().url()).searchParams;
    asked.push(q.get("q") ? `q=${q.get("q")}` : `category=${q.get("category")}`);
    const items = q.get("category") === "baths"
      ? [product({ id: "viator:B1", provider: "viator", providerKey: "B1", title: "Budapest Thermal Bath Day Pass", detailUrl: "/tours/viator/B1" })]
      : [];
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ items, providers }) });
  });
  await page.goto("/attractions/lukacs-thermal-bath");
  const row = page.getByTestId("contextual-tours");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator(".mk-card")).toHaveCount(1);
  await expect(row.getByRole("heading", { name: "Thermal baths and spa experiences" })).toBeVisible();
  await expect(row).toContainText("not tickets for Lukács Thermal Bath");
  await expect(row.locator(".mk-card a")).toHaveAttribute("href", "/tours/viator/B1");
  await expect(row.locator('a[href^="http"]:not(.mk-venue-credit a)')).toHaveCount(0);
  await expect(row.getByRole("link", { name: /See all tours/ })).toHaveAttribute("href", /category=baths/);
  expect(asked[0]).toMatch(/^q=/);
  expect(asked).toContain("category=baths");
});

test("when a product really names the place, only that row is shown and the wider row is never requested", async ({ page }) => {
  const asked: string[] = [];
  await page.route("**/api/marketplace/search?*", (route) => {
    const q = new URL(route.request().url()).searchParams;
    asked.push(q.get("q") ? "place" : "category");
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        items: [product({ id: "viator:H1", provider: "viator", providerKey: "H1", title: "Hospital in the Rock Guided Tour", detailUrl: "/tours/viator/H1" })],
        providers,
      }),
    });
  });
  await page.goto("/attractions/hospital-in-the-rock");
  const row = page.getByTestId("contextual-tours");
  await row.scrollIntoViewIfNeeded();
  await expect(row.getByRole("heading", { name: "Tickets and tours for Hospital in the Rock" })).toBeVisible();
  expect(asked).toEqual(["place"]);
});

test("when the partners list nothing at all, no row and no invented offer appears", async ({ page }) => {
  await page.route("**/api/marketplace/search?*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ items: [], providers }) }),
  );
  await page.goto("/attractions/great-market-hall");
  const row = page.getByTestId("contextual-tours");
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.locator(".mk-card")).toHaveCount(0);
  await expect(row.locator("section")).toHaveCount(0);
});

// Placement rules after combining the tour rail (PR #50) with the new attraction rows: one tour row per page, and the
// GoIceCars car-rental card only where driving is part of the plan.
const RENTAL_HREF = "https://www.goicecars.com/en?pickup=BUD#rental-search";

test("car rental card: only on day-trip places and getting-around guides, with the exact GoIceCars link and no price", async ({ page }) => {
  for (const slug of ["memento-park", "godollo-royal-palace"]) {
    await page.goto(`/attractions/${slug}`);
    const card = page.getByTestId("budapest-car-rental");
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("heading", { name: "Car rental in Budapest" })).toBeVisible();
    await expect(card.getByRole("link", { name: /Search Budapest rental cars/ })).toHaveAttribute("href", RENTAL_HREF);
    await expect(card).not.toContainText(/[€$£]\s?\d|\d\s?(EUR|USD|HUF|ISK)/);
  }
  for (const route of ["/attractions/szimpla-kert", "/attractions/matthias-church", "/guides/budapest-thermal-baths", "/guides/danube-cruises", "/experiences/danube"]) {
    await page.goto(route);
    await expect(page.getByTestId("budapest-car-rental"), route).toHaveCount(0);
  }
  await page.goto("/guides/getting-around-budapest");
  await expect(page.getByTestId("budapest-car-rental")).toHaveCount(1);
});

test("never two tour rows on one page; the side rail on a guide holds the single contextual row", async ({ page }) => {
  for (const route of ["/attractions/godollo-royal-palace", "/attractions/lukacs-thermal-bath", "/guides/budapest-thermal-baths", "/neighbourhoods/castle-district"]) {
    await page.goto(route);
    await expect(page.getByTestId("contextual-tours"), route).toHaveCount(1);
  }
  await page.goto("/guides/budapest-thermal-baths");
  await expect(page.locator("aside.article-tour-rail")).toHaveCount(1);
});
