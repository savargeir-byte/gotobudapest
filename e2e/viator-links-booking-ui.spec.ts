import { expect, test } from "@playwright/test";

// MOCKED provider (dedicated server, port 3101). Production showed Viator cards whose product page answered 404, because the
// listing and the detail page judged a product by different rules. They now share one rule: every Viator card on /tours, in every
// category and on every page of results, must open a product page that loads, and the provider's affiliate URL must stay intact.

type Item = { id: string; provider: string; providerKey: string; title: string; detailUrl: string; bookingUrl?: string };

test("every Viator card in every category opens a product page that loads (no 404 or 502), with the affiliate URL untouched", async ({ request }, info) => {
  test.skip(info.project.name !== "booking-ui-desktop", "one pass over the API is enough");
  test.setTimeout(180_000);
  const seen = new Map<string, Item>();
  for (const category of ["", "cruises", "baths", "walking", "food", "tickets", "daytrips", "transfers", "sightseeing", "nightlife"]) {
    let cursor = "";
    for (let page = 0; page < 6; page++) {
      const qs = new URLSearchParams({ provider: "viator", ...(category ? { category } : {}), ...(cursor ? { cursor } : {}) });
      const res = await request.get(`/api/marketplace/search?${qs}`);
      expect(res.status(), `search ${qs}`).toBe(200);
      const body = (await res.json()) as { items: Item[]; nextCursor?: string };
      for (const p of body.items) if (p.provider === "viator") seen.set(p.id, p);
      if (!body.nextCursor) break;
      cursor = body.nextCursor;
    }
  }
  expect(seen.size).toBeGreaterThan(5);
  const broken: string[] = [];
  for (const p of seen.values()) {
    expect(p.title, `${p.id} must not be a foreign product`).not.toMatch(/Reykjavik|Golden Circle|Whale watching/i);
    expect(p.detailUrl).toMatch(/^\/tours\/viator\/[A-Za-z0-9]+$/);
    // The provider's own URL, with its tracking parameters, is carried unchanged.
    if (p.bookingUrl) expect(p.bookingUrl).toMatch(/[?&]pid=/);
    const res = await request.get(p.detailUrl);
    if (res.status() !== 200) broken.push(`${p.detailUrl} -> ${res.status()}`);
  }
  expect(broken, `Viator cards whose product page fails (${seen.size} checked)`).toEqual([]);
});

test("the cards a visitor can see on /tours all link to loading product pages", async ({ page, request }) => {
  await page.goto("/tours?provider=viator");
  await page.locator("main .mk-card").first().waitFor({ state: "visible", timeout: 20_000 });
  const hrefs = await page.locator('main .mk-card a.mk-cta').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href") || ""))]);
  expect(hrefs.length).toBeGreaterThan(3);
  for (const h of hrefs) {
    expect(h).toMatch(/^\/tours\/viator\//);
    expect((await request.get(h)).status(), h).toBe(200);
  }
});
