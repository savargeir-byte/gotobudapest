import { expect, test } from "@playwright/test";

// MOCKED provider (port 3101). The UX and conversion pass: one honest booking entry point, tours reachable at once,
// booking CTAs that say what they do and keep the provider's affiliate URL, and discovery that stays crawlable.

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => (route.request().resourceType() === "image" ? route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg }) : route.abort()),
  );
});

test("the header action opens the tours page and says so", async ({ page }) => {
  await page.goto("/");
  const cta = page.locator("header .header-cta");
  await expect(cta).toHaveText("Book tours");
  await expect(cta).toHaveAttribute("href", "/tours");
});

test("every card says View details, because it opens our product page, not the provider's availability", async ({ page }) => {
  await page.goto("/tours?provider=viator");
  await page.locator(".mk-card").first().waitFor({ state: "visible", timeout: 20_000 });
  const labels = await page.locator(".mk-card .mk-cta").evaluateAll((as) => as.map((a) => (a.textContent || "").trim()));
  expect(labels.length).toBeGreaterThan(0);
  for (const l of labels) expect(l).toMatch(/^View details/);
  await page.goto("/");
  await page.locator(".home-tours .mk-card").first().waitFor({ state: "visible", timeout: 20_000 });
  for (const l of await page.locator(".home-tours .mk-card .mk-cta").evaluateAll((as) => as.map((a) => (a.textContent || "").trim()))) expect(l).toMatch(/^View details/);
});

test("tours page: the search and the category filters are in the first screen", async ({ page }) => {
  const vp = page.viewportSize()!;
  await page.goto("/tours");
  const search = page.getByRole("searchbox");
  await expect(search).toBeVisible();
  const box = (await search.boundingBox())!;
  expect(box.y + box.height, "search box fully inside the first screen").toBeLessThanOrEqual(vp.height);
  const tab = (await page.locator(".mk-tabs a").first().boundingBox())!;
  expect(tab.y, "category filters start inside the first screen").toBeLessThan(vp.height);
});

test("home: tours first, then places, guides before the neighbourhood grid, and every neighbourhood stays a link", async ({ page, request }) => {
  await page.goto("/");
  const order = await page.evaluate(() => {
    const y = (sel: string) => (document.querySelector(sel)?.getBoundingClientRect().top ?? -1) + window.scrollY;
    return { tours: y("#book-tours"), trust: y(".home-trust"), places: y("#explore"), guides: y("#travel-guides"), hoods: y("#neighbourhoods") };
  });
  expect(order.tours).toBeGreaterThan(0);
  expect(order.trust).toBeGreaterThan(order.tours);
  expect(order.places).toBeGreaterThan(order.trust);
  expect(order.guides).toBeGreaterThan(order.places);
  expect(order.hoods).toBeGreaterThan(order.guides);
  await expect(page.locator(".home-trust")).toContainText("takes no payments");
  await expect(page.locator(".home-trust a[href='/about']")).toBeVisible();
  // No neighbourhood page loses its link from the homepage: the cards plus the plain list cover all of them.
  const xml = await (await request.get("/sitemap.xml")).text();
  const slugs = [...xml.matchAll(/<loc>[^<]*\/neighbourhoods\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);
  expect(slugs.length).toBeGreaterThan(8);
  const linked = await page.locator("main a[href^='/neighbourhoods/']").evaluateAll((as) => [...new Set(as.map((a) => (a.getAttribute("href") || "").split("/")[2]))]);
  for (const s of slugs) expect(linked, s).toContain(s);
});

test("Viator product page: booking panel beside the photos with price and cancellation, affiliate URL untouched", async ({ page, request }) => {
  const res = await request.get("/api/marketplace/search?provider=viator");
  const item = ((await res.json()) as { items: { detailUrl: string; provider: string }[] }).items.find((i) => i.provider === "viator")!;
  await page.goto(item.detailUrl);
  const panel = page.locator("#availability");
  await expect(panel).toBeVisible();
  const cta = panel.getByRole("link", { name: /Book on Viator/ });
  await expect(cta).toHaveAttribute("href", /[?&]pid=/);
  await expect(cta).toHaveAttribute("rel", /sponsored/);
  await expect(cta).toHaveAttribute("target", "_blank");
  const vp = page.viewportSize()!;
  if (vp.width > 900) {
    // Wide screens: the panel starts inside the first screen, level with the gallery, not after it.
    const gallery = (await page.locator(".vp-gallery-main").first().boundingBox())!;
    const box = (await panel.boundingBox())!;
    expect(box.y, "panel starts inside the first screen").toBeLessThan(vp.height);
    expect(box.y).toBeLessThan(gallery.y + gallery.height);
  } else {
    const bar = page.locator(".vp-sticky");
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: /Book on Viator/ })).toHaveAttribute("href", (await cta.getAttribute("href"))!);
  }
});

test("Tiqets product page on a phone keeps the exact provider link in reach", async ({ page, request }) => {
  test.skip(page.viewportSize()!.width > 900, "the sticky bar is for phones");
  const res = await request.get("/api/marketplace/search?provider=tiqets");
  const item = ((await res.json()) as { items: { detailUrl: string; provider: string }[] }).items.find((i) => i.provider === "tiqets")!;
  await page.goto(item.detailUrl);
  const main = page.getByRole("link", { name: /Continue to Tiqets/ });
  const bar = page.locator(".vp-sticky").getByRole("link", { name: /Tickets on Tiqets/ });
  if (!(await main.count())) {
    // Not on sale: no bar and no provider link, by design.
    await expect(bar).toHaveCount(0);
    return;
  }
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute("href", (await main.getAttribute("href"))!);
  await expect(bar).toHaveAttribute("rel", /sponsored/);
});

test("attraction page on a phone: tours come right after the main photo, before the photo gallery", async ({ page }) => {
  test.skip(page.viewportSize()!.width > 980, "wide screens use the right-hand column");
  await page.goto("/attractions/hungarian-parliament");
  const rail = (await page.locator(".attraction-booking-rail").boundingBox())!;
  const gallery = (await page.locator("#photos").boundingBox())!;
  expect(rail.y).toBeLessThan(gallery.y);
});
