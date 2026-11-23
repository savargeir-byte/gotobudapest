import { expect, test, type Page } from "@playwright/test";

// MOCKED provider catalogue (same dedicated server as the other booking-ui specs, port 3101).
// Every tour/ticket card on every surface must show a picture that actually loaded: the supplier's own
// photo when a usable one exists, otherwise a credited photograph from our library that says what it is
// (a photo of the venue, or an illustration of the city or category, never the product itself).

// Supplier CDN photographs are stood in for by a local SVG (the mock catalogue's URLs are not real hosts);
// every other external request is refused, so nothing outside this machine is contacted.
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) =>
      route.request().resourceType() === "image"
        ? route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg })
        : route.abort(),
  );
});

const CATEGORIES = ["", "cruises", "baths", "walking", "food", "tickets", "daytrips", "transfers", "sightseeing", "nightlife"];

// Scroll through the page so every lazy image starts loading, then wait until each card image has decoded.
async function settle(page: Page, scope = "main") {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForFunction(
    (sel) => [...document.querySelectorAll(`${sel} .mk-card img`)].every((i) => (i as HTMLImageElement).complete),
    scope,
    { timeout: 20_000 },
  );
}

async function expectEveryCardHasALoadedImage(page: Page, where: string, scope = "main") {
  await page.locator(`${scope} .mk-card`).first().waitFor({ state: "visible", timeout: 20_000 });
  await settle(page, scope);
  const cards = await page.locator(`${scope} .mk-card`).evaluateAll((els) =>
    els.map((el) => {
      const img = el.querySelector("img") as HTMLImageElement | null;
      return {
        id: el.getAttribute("data-product"),
        hasImg: !!img,
        loaded: !!img && img.naturalWidth > 0,
        alt: img?.alt ?? "",
        local: !!img && !/^https?:/.test(img.getAttribute("src") ?? ""),
        label: el.querySelector(".mk-venue-credit")?.textContent ?? "",
        title: el.querySelector("h3")?.textContent ?? "",
        box: (el.querySelector(".mk-card-img") as HTMLElement | null)?.getBoundingClientRect().height ?? 0,
      };
    }),
  );
  expect(cards.length, `${where}: no cards`).toBeGreaterThan(0);
  for (const c of cards) {
    expect(c.hasImg, `${where}: ${c.id} (${c.title}) has no image`).toBe(true);
    expect(c.loaded, `${where}: ${c.id} (${c.title}) image did not load`).toBe(true);
    expect(c.alt.length, `${where}: ${c.id} image has no alt text`).toBeGreaterThan(5);
    expect(c.box, `${where}: ${c.id} image box collapsed`).toBeGreaterThan(60);
    // Our own photographs always say what they are and who took them; supplier photos have no such line.
    if (c.local) {
      expect(c.label, `${where}: ${c.id} local photo is not labelled`).toMatch(/^(Illustrative photo:|Photo of |Featured stop:)/);
      expect(c.label, `${where}: ${c.id} credit missing`).toContain("Photo:");
    }
  }
  return cards.length;
}

test("/tours: every card in every category tab has a loaded, honestly labelled image", async ({ page }) => {
  test.setTimeout(240_000);
  let total = 0;
  for (const c of CATEGORIES) {
    await page.goto(c ? `/tours?category=${c}` : "/tours");
    const cards = page.locator("main .mk-card");
    if ((await cards.count().catch(() => 0)) === 0) await page.waitForTimeout(1500);
    if ((await cards.count()) === 0) continue; // a category with no mock products
    total += await expectEveryCardHasALoadedImage(page, `/tours?category=${c || "all"}`);
  }
  expect(total).toBeGreaterThan(10);
});

test("home: the tour row shows pictures on every card", async ({ page }) => {
  await page.goto("/");
  await expectEveryCardHasALoadedImage(page, "/");
});

test("editorial pages: the tour rail and contextual rows show pictures on every card", async ({ page }) => {
  test.setTimeout(240_000);
  for (const path of ["/attractions/danube-promenade-dunakorzo", "/attractions/szechenyi-thermal-bath", "/neighbourhoods/castle-district", "/guides/danube-cruises", "/guides/budapest-thermal-baths", "/experiences/danube"]) {
    await page.goto(path);
    const cards = page.locator("main .mk-card");
    await cards.first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => undefined);
    if ((await cards.count()) === 0) continue;
    await expectEveryCardHasALoadedImage(page, path);
  }
});

test("a Tiqets product page without a supplier photo shows a labelled, credited picture", async ({ page }) => {
  await page.goto("/tours?provider=tiqets");
  const href = await page.locator('main .mk-card[data-provider="tiqets"] a.mk-cta').first().getAttribute("href");
  expect(href).toMatch(/^\/tours\/tiqets\/\d+$/);
  await page.goto(href!);
  const figure = page.locator("figure.mk-place-photo");
  await expect(figure).toHaveCount(1);
  await expect(figure.locator("img")).toBeVisible();
  await expect(figure.locator("figcaption")).toContainText(/Illustrative photo:|Photo of |Featured stop:/);
  await expect(figure.locator("figcaption")).toContainText("Photo:");
  expect(await figure.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
});

test("when a supplier photo does not load, the card switches to a labelled, credited photo of ours", async ({ page }) => {
  // Routes registered later win: this turns every supplier image into a hard failure.
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => route.abort(),
  );
  await page.goto("/tours?provider=viator");
  await page.locator("main .mk-card").first().waitFor({ state: "visible", timeout: 20_000 });
  await settle(page);
  // Cards that came with a supplier photo must now be showing ours (and no broken image remains anywhere).
  await expect(page.locator("main .mk-card[data-supplier-photo-failed], main .mk-card:has([data-supplier-photo-failed])").first()).toBeVisible({ timeout: 15_000 }).catch(() => undefined);
  await expect.poll(() => page.locator("main .mk-card img").evaluateAll((els) => els.filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0).length), { timeout: 15_000 }).toBe(0);
  const failedBoxes = page.locator("main .mk-venue-img[data-supplier-photo-failed='true']");
  expect(await failedBoxes.count()).toBeGreaterThan(0);
  for (const credit of await page.locator("main .mk-card:has([data-supplier-photo-failed]) .mk-venue-credit").allTextContents())
    expect(credit).toMatch(/^(Illustrative photo:|Photo of |Featured stop:).*Photo:/);
  expect(await page.locator("main .mk-card:not(:has(img))").count()).toBe(0);
});

test("no horizontal scroll and no overflowing image on /tours", async ({ page }) => {
  await page.goto("/tours");
  await page.locator("main .mk-card").first().waitFor({ state: "visible", timeout: 20_000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const wide = await page.locator("main .mk-card img").evaluateAll((els) =>
    els.filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length,
  );
  expect(wide).toBe(0);
});
