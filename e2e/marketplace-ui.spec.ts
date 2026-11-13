// Browser-level tests of the /tours marketplace UI, the editorial product rows and the
// Tiqets product page, desktop and mobile. ALL MOCKED: the site is served by the dedicated
// `next start` (port 3101) whose provider calls go to e2e/support/mock-provider.mjs on
// 127.0.0.1. Every non-local browser request is intercepted, so no live provider is
// contacted. These tests prove UI behaviour against synthetic responses; they are NOT live
// availability, pricing or booking verification.
//
// Provider failures are simulated by intercepting the browser's own /api/marketplace/search
// calls, never by switching the mock's global scenario (other specs share that state).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { ANY_PHOTO_640, ANY_PHOTO_SRCSET, photoKey, photoKeysIn } from "./support/photo-urls";

const MOCK = "http://127.0.0.1:3900";
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

type Env = { external: string[] };
async function prepare(page: Page): Promise<Env> {
  const env: Env = { external: [] };
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      env.external.push(`${req.resourceType()} ${new URL(req.url()).hostname}`);
      if (req.resourceType() === "image") return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg });
      return route.abort();
    },
  );
  return env;
}
const documents = (env: Env) => env.external.filter((e) => e.startsWith("document "));
const cards = (page: Page) => page.locator(".mk-card");

// A venue-photo credit is valid when it names an author and its links are real: every anchor is a non-empty https URL
// that opens safely, and a third-party (licensed) photograph keeps BOTH its licence and its source link, with the
// source on Wikimedia Commons. The owner's own photographs ("Used with permission") legitimately carry no links.
async function expectValidPhotoCredit(credit: Locator) {
  const text = (await credit.innerText()).replace(/\s+/g, " ");
  const author = text.match(/Photo: ([^·]+?)(?: ·|$)/)?.[1]?.trim();
  expect(author, "the credit names an author").toBeTruthy();
  const anchors = await credit.locator("a").evaluateAll((els) =>
    els.map((a) => ({ href: a.getAttribute("href") ?? "", rel: a.getAttribute("rel") ?? "", text: a.textContent ?? "" })),
  );
  for (const a of anchors) {
    expect(a.href, "no empty or non-https credit link").toMatch(/^https:\/\/[^/\s]+/);
    expect(a.rel).toBe("noopener noreferrer");
  }
  if (anchors.length === 0) {
    // No links is only acceptable for a photograph the owner supplied, and the credit must say so.
    expect(text).toMatch(/Used with permission/);
  } else {
    expect(anchors, "licence link and source link").toHaveLength(2);
    expect(anchors[0].href).toMatch(/^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//);
    expect(anchors[1].href).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    expect(anchors[1].text).toBe("Wikimedia Commons");
  }
}

// The photograph a card shows for a venue must be a photograph OF that venue: either the very asset the venue's own
// attraction page shows, or our verified, credited local photograph stored under the venue's own slug (used when the
// page's published photo carries no credit data). Anything else, such as another venue's file, fails.
async function expectSameAsAttractionPage(page: Page, img: Locator, slug: string) {
  const html = await (await page.request.get(`/attractions/${slug}`)).text();
  const cardKey = photoKey((await img.getAttribute("src")) ?? "");
  expect(cardKey, "the card photo is one of our own assets").toBeTruthy();
  const onPage = photoKeysIn(html).has(cardKey!);
  expect(onPage || cardKey === slug, `the card photo (${cardKey}) is a photograph of ${slug}`).toBe(true);
}

test.describe("marketplace page", () => {
  test("renders products server-side with internal links only on every card", async ({ page }) => {
    const env = await prepare(page);
    const res = await page.goto("/tours");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: /Budapest tours/ })).toBeVisible();
    await expect(cards(page).first()).toBeVisible();
    expect(await cards(page).count()).toBeGreaterThan(5);
    // Exactly one product link per card, always internal; no provider URL anywhere on a card. The only
    // other links are the photo credit (licence + Wikimedia source) under an editorial venue photo.
    const links = await cards(page).evaluateAll((els) =>
      els.map((el) => ({
        provider: el.getAttribute("data-provider"),
        product: [...el.querySelectorAll("a:not(.mk-venue-credit a)")].map((a) => a.getAttribute("href")),
        credit: [...el.querySelectorAll(".mk-venue-credit a")].map((a) => a.getAttribute("href")),
      })),
    );
    for (const l of links) {
      expect(l.product).toHaveLength(1);
      expect(l.product[0]).toMatch(new RegExp(`^/tours/${l.provider}/[A-Za-z0-9-]+$`));
      for (const href of l.credit) expect(href).toMatch(/^https:\/\/(commons\.wikimedia\.org|creativecommons\.org)\//);
    }
    // Every venue-photo credit on the page is complete and has no empty or unsafe link.
    const credits = page.locator(".mk-venue-credit");
    for (let i = 0; i < (await credits.count()); i++) await expectValidPhotoCredit(credits.nth(i));
    expect(new Set(links.map((l) => l.provider)).size).toBeGreaterThan(1);
    await expect(cards(page).first().getByRole("link", { name: /View details/ })).toBeVisible();
    await expect(page.locator('.mk-card a[target="_blank"]:not(.mk-venue-credit a)')).toHaveCount(0);
    expect(documents(env)).toEqual([]);
  });

  test("viator and tiqets cards open GoToBudapest product URLs, never the provider", async ({ page }) => {
    const env = await prepare(page);
    await page.goto("/tours?provider=tiqets");
    const tiqets = cards(page).first();
    await expect(tiqets).toHaveAttribute("data-provider", "tiqets");
    const id = (await tiqets.getAttribute("data-product"))!.split(":")[1];
    await tiqets.getByRole("link", { name: /View details/ }).click();
    await expect(page).toHaveURL(new RegExp(`/tours/tiqets/${id}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/tours?provider=viator");
    const viator = cards(page).first();
    await expect(viator).toHaveAttribute("data-provider", "viator");
    const code = (await viator.getAttribute("data-product"))!.split(":")[1];
    const href = await viator.getByRole("link", { name: /View details/ }).getAttribute("href");
    expect(href).toBe(`/tours/viator/${code}`);
    expect(href!.startsWith("/tours/viator/")).toBe(true); // an internal page, never the provider
    expect(documents(env).filter((d) => /viator|tiqets/.test(d))).toEqual([]);
  });

  test("a card shows only supplied data: image only where authorised, no invented fields", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours?provider=tiqets");
    // The Tiqets key tier returns no licensed photographs (the mock even offers one to prove it is dropped).
    // The only photographs on a Tiqets card are OUR credited venue photos, from this site.
    await expect(cards(page).first()).toBeVisible();
    const sources = await page.locator(".mk-card img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute("src")));
    for (const s of sources) expect(s).toMatch(ANY_PHOTO_640);
    await expect(page.locator(".mk-card:not(:has(.mk-venue-img)) img")).toHaveCount(0);
    await expect(cards(page).first().locator(".mk-badge")).toHaveText("Tiqets");
    await page.goto("/tours?provider=viator");
    await expect(cards(page).first().locator("img")).toHaveCount(1);
    await expect(cards(page).first().locator("img")).toHaveAttribute("referrerpolicy", "no-referrer");
    // Free cancellation is shown only when the API said so.
    const free = await page.locator(".mk-green").count();
    const total = await cards(page).count();
    expect(free).toBeLessThan(total);
  });

  test("Tiqets cards show a credited photo of the exact venue only on a verified match; others stay text cards", async ({ page }) => {
    const env = await prepare(page);
    await page.goto("/tours?provider=tiqets");
    const venue = page.locator(".mk-card:has(.mk-venue-img)");
    await expect(venue.first()).toBeVisible();
    const card = venue.first();
    await expect(card).toHaveAttribute("data-provider", "tiqets");
    await expect(card.locator("h3")).toContainText("St. Stephen's Basilica");
    const img = card.locator(".mk-venue-img img");
    // One of our own renditions (this site or our Sanity CDN), and the same photograph the basilica's own page shows.
    await expect(img).toHaveAttribute("src", ANY_PHOTO_640);
    await expect(img).toHaveAttribute("srcset", ANY_PHOTO_SRCSET);
    await expectSameAsAttractionPage(page, img, "st-stephens-basilica");
    await expect(img).toHaveAttribute("alt", /St\.? Stephen['’]s Basilica/);
    // The browser picked one of our two real renditions, it decoded, and it is at least as wide (in device
    // pixels) as the box it fills, so it is never stretched. Reserved dimensions mean no layout shift.
    await expect.poll(() => img.evaluate((e) => (e as HTMLImageElement).complete && /-(640|1280)\.webp$|[?&]w=(640|1280)(&|$)/.test((e as HTMLImageElement).currentSrc))).toBe(true);
    const fit = await img.evaluate((e) => {
      const i = e as HTMLImageElement;
      const file = /-1280\.webp$|[?&]w=1280(&|$)/.test(i.currentSrc) ? 1280 : 640;
      return { file, shown: i.getBoundingClientRect().width * window.devicePixelRatio };
    });
    expect(fit.file).toBeGreaterThanOrEqual(Math.min(fit.shown, 640) * 0.95);
    expect(Number(await img.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(await img.getAttribute("height"))).toBeGreaterThan(0);
    // Honest wording and a legally sufficient credit: author, licence link, source link.
    const credit = card.locator(".mk-venue-credit");
    await expect(credit).toContainText("not a photo of this product");
    await expect(credit).toContainText(/Photo of St\.? Stephen['’]s Basilica/);
    await expectValidPhotoCredit(credit);
    // A product that only names one stop says so: a featured stop, never a photo of the product itself.
    const featured = page.locator(".mk-card:has(.mk-venue-img)").filter({ hasText: "Matthias Church Entry" });
    await expect(featured.locator(".mk-venue-img img")).toHaveAttribute("src", ANY_PHOTO_640);
    await expectSameAsAttractionPage(page, featured.locator(".mk-venue-img img"), "matthias-church");
    await expect(featured.locator(".mk-venue-credit")).toContainText("Featured stop: Matthias Church. Photo of Matthias Church, not a photo of this product.");
    await expectValidPhotoCredit(featured.locator(".mk-venue-credit"));
    // Every other Tiqets product has NO photo box at all (no unrelated venue photo, no empty frame).
    const plain = page.locator(".mk-card:not(:has(.mk-venue-img))");
    expect(await plain.count()).toBeGreaterThan(5);
    await expect(plain.locator("img")).toHaveCount(0);
    const titles = await page.locator(".mk-card:has(.mk-venue-img) h3").allTextContents();
    for (const t of titles) expect(t).toMatch(/St. Stephen's Basilica|Matthias Church Entry/);
    // No provider image is fetched; our own venue photographs come from this site or, with Sanity content, from its own CDN.
    expect(env.external.filter((e) => e.startsWith("image ") && e !== "image cdn.sanity.io")).toEqual([]);
    // Viator cards keep their provider photographs and are never given a venue photo.
    await page.goto("/tours?provider=viator");
    await expect(page.locator(".mk-card .mk-venue-img")).toHaveCount(0);
    await expect(cards(page).first().locator("img")).toHaveAttribute("src", /^https:\/\/media\.example\.com\//);
  });

  test("search, category tabs, chips and clear all update the URL and the results", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    const search = page.getByRole("searchbox");
    await search.fill("cruise");
    await search.press("Enter");
    await expect(page).toHaveURL(/[?&]q=cruise/);
    await expect(page.getByTestId("mk-skeleton")).toHaveCount(0);
    await expect(cards(page).first()).toBeVisible();

    const tab = page.getByRole("navigation", { name: "Tour categories" }).getByRole("link", { name: /Thermal baths/ });
    await tab.click();
    await expect(page).toHaveURL(/category=baths/);
    await expect(page.getByRole("list", { name: "Active filters" })).toBeVisible();

    await page.getByRole("link", { name: "Remove filter: Thermal baths & spas" }).first().click();
    await expect(page).not.toHaveURL(/category=/);
    await expect(page).toHaveURL(/q=cruise/);
    await page.getByRole("link", { name: /Clear all/ }).first().click();
    await expect(page).not.toHaveURL(/q=/);
    await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
  });

  test("provider filter narrows results and the capability note names the providers that ignore a control", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours?provider=tiqets");
    const providers = await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-provider")));
    expect(providers.length).toBeGreaterThan(0);
    expect(new Set(providers)).toEqual(new Set(["tiqets"]));
    // Tiqets cannot filter by price on the server: the (visually hidden) filter column still says so instead of pretending.
    const price = page.locator(".mk-filters .mk-note").filter({ hasText: "Tiqets" });
    await expect(price.first()).toBeAttached();
    // No sort by duration is ever offered, nor a global price ordering claim.
    await page.goto("/tours");
    const options = await page.locator("#mk-sort option").allTextContents();
    expect(options.join("|")).not.toMatch(/duration/i);
    await expect(page.locator(".mk-filters")).toContainText("not a global ranking");
  });

  test("deep links are shareable and keep the cursor out of the URL", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours?category=cruises&sort=rating&minRating=4");
    await expect(page.getByRole("link", { name: /Remove filter/ }).first()).toBeVisible();
    await expect(page.locator("#mk-sort")).toHaveValue("rating");
    await expect(page).toHaveURL(/category=cruises/);
    await expect(page).not.toHaveURL(/cursor/);
  });

  test("Load more appends a deduplicated page once, even on a double click", async ({ page }) => {
    await prepare(page);
    let moreRequests = 0;
    await page.route("**/api/marketplace/search?*", async (route) => {
      if (new URL(route.request().url()).searchParams.has("cursor")) {
        moreRequests += 1;
        await new Promise((r) => setTimeout(r, 1200)); // keep the first request in flight
      }
      await route.continue();
    });
    await page.goto("/tours");
    const before = await cards(page).count();
    const more = page.getByRole("button", { name: "Load more tours" });
    await expect(more).toBeVisible();
    // Two clicks in the same task: the second must be ignored while the first is in flight.
    await more.evaluate((el) => {
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
    });
    await expect(async () => expect(await cards(page).count()).toBeGreaterThan(before)).toPass();
    expect(moreRequests).toBe(1);
    const ids = await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-product")));
    expect(new Set(ids).size).toBe(ids.length);
    await expect(page).not.toHaveURL(/cursor/);
  });

  test("a failed catalogue shows a retryable error, an empty one an honest empty state", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    let mode: "error" | "empty" | "ok" = "error";
    await page.route("**/api/marketplace/search?*", (route) => {
      if (mode === "ok") return route.continue();
      if (mode === "error") return route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"x"}' });
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ items: [], providers: { viator: { status: "empty", count: 0 }, tiqets: { status: "empty", count: 0 }, tourdesk: { status: "empty", count: 0 } } }),
      });
    });
    await page.getByRole("searchbox").fill("cruise");
    await page.getByRole("searchbox").press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: "temporarily unavailable" })).toBeVisible();
    mode = "ok";
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(cards(page).first()).toBeVisible();
    mode = "empty";
    await page.getByRole("searchbox").fill("nothing-here");
    await page.getByRole("searchbox").press("Enter");
    await expect(page.getByTestId("mk-empty")).toBeVisible();
    await expect(page.getByTestId("mk-empty")).toContainText("No tours match your search");
    await expect(cards(page)).toHaveCount(0);
  });

  test("a stale slow response never replaces a newer search", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    await page.route("**/api/marketplace/search?*", async (route) => {
      const q = new URL(route.request().url()).searchParams.get("q");
      if (q === "slowterm") await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    const search = page.getByRole("searchbox");
    await search.fill("slowterm");
    await search.press("Enter");
    await search.fill("cruise");
    await search.press("Enter");
    await expect(page).toHaveURL(/q=cruise/);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/q=cruise/);
    await expect(search).toHaveValue("cruise");
  });
});

test.describe("marketplace inventory and scrolling", () => {
  test("there is no artificial cap: a full first page, then Load more keeps walking provider pages", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    const first = await cards(page).count();
    expect(first).toBeGreaterThanOrEqual(24);
    const pages: number[] = [first];
    // Walk several pages; the mock catalogue is finite so the button eventually disappears.
    for (let i = 0; i < 6; i++) {
      const more = page.getByRole("button", { name: "Load more tours" });
      if (!(await more.isVisible())) break;
      const y = await page.evaluate(() => window.scrollY);
      const before = await cards(page).count();
      await more.click();
      await expect(async () => expect(await cards(page).count()).toBeGreaterThan(before)).toPass();
      pages.push(await cards(page).count());
      // The viewport stays where it was: loading more never jumps to the top.
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.min(y, 1) );
    }
    expect(pages.length).toBeGreaterThan(2);
    const ids = await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-product")));
    expect(new Set(ids).size).toBe(ids.length);
    const providers = new Set(await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-provider"))));
    expect(providers).toEqual(new Set(["viator", "tiqets", "tourdesk"]));
    expect(ids.length).toBeGreaterThan(50);
    await expect(page).not.toHaveURL(/cursor/);
  });

  test("Viator and Tiqets stay visible when TourDesk returns nothing; a provider error is shown as an error", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    const live = (await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-product")))).filter((id) => !id!.startsWith("tourdesk"));
    expect(live.length).toBeGreaterThan(10);
    // Simulate (in the browser's own API call) TourDesk empty and Tiqets failing.
    await page.route("**/api/marketplace/search?*", async (route) => {
      const upstream = await route.fetch();
      const body = await upstream.json();
      body.items = body.items.filter((p: { provider: string }) => p.provider === "viator");
      body.providers.tourdesk = { status: "empty", count: 0, total: 0 };
      body.providers.tiqets = { status: "error", count: 0, note: "Tiqets is temporarily unavailable" };
      await route.fulfill({ response: upstream, json: body });
    });
    await page.getByRole("searchbox").fill("walking");
    await page.getByRole("searchbox").press("Enter");
    await expect(cards(page).first()).toBeVisible();
    expect(await cards(page).evaluateAll((els) => els.every((e) => e.getAttribute("data-provider") === "viator"))).toBe(true);
    await expect(page.locator('[data-provider-status="tiqets"]')).toContainText("Tiqets is temporarily unavailable");
    // An error in one provider is never reported as an empty catalogue.
    await expect(page.getByTestId("mk-empty")).toHaveCount(0);
  });

  test("a result count appears only when the API supplied totals", async ({ page }) => {
    await prepare(page);
    await page.route("**/api/marketplace/search?*", async (route) => {
      const upstream = await route.fetch();
      const body = await upstream.json();
      for (const p of ["viator", "tiqets", "tourdesk"]) delete body.providers[p].total;
      await route.fulfill({ response: upstream, json: body });
    });
    await page.goto("/tours");
    await page.getByRole("searchbox").fill("cruise");
    await page.getByRole("searchbox").press("Enter");
    await expect(page.locator(".mk-count")).toHaveText(/^Showing [0-9]+ results?$/);
    await expect(page.locator(".mk-count")).not.toContainText("about");
  });

  test("opening a product from a scrolled list lands at the top of the product page", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    const card = page.locator('.mk-card[data-provider="tiqets"]').nth(4);
    await card.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    const id = (await card.getAttribute("data-product"))!.split(":")[1];
    await card.getByRole("link", { name: /View details/ }).click();
    await expect(page).toHaveURL(new RegExp("/tours/tiqets/" + id + "$"));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("changing a filter does not scroll the page to the top", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    await page.locator(".mk-card").nth(8).scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    expect(y).toBeGreaterThan(300);
    const tab = page.getByRole("navigation", { name: "Tour categories" }).getByRole("link", { name: /Cruises/ });
    await tab.evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/category=cruises/);
    await expect(cards(page).first()).toBeVisible();
    // Results are shorter now, so the browser may clamp, but the page is never forced to 0 by us.
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});

test.describe("home page", () => {
  test("places genuine bookable products directly after hero before editorial", async ({ page }) => {
    const env = await prepare(page);
    await page.goto("/");
    const section = page.getByTestId("homepage-tours");
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading", { name: /Featured tours/ })).toBeVisible();
    await expect(section.locator(".mk-card").first()).toBeVisible();
    const count = await section.locator(".mk-card").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
    await expect(section.locator(".mk-cta").first()).toContainText("Check availability");
    await expect(section.locator(".mk-card .mk-cta").first()).toHaveAttribute("href", /^\/tours\//);
    // Feature cards link to internal products, never directly to a generic provider landing page.
    await expect(section.locator('.mk-card a[href^="https://www.viator.com"]')).toHaveCount(0);
    await expect(section.getByRole("link", { name: /See all Budapest tours/ })).toHaveAttribute("href", "/tours");
    const order = await page.locator("main > *").evaluateAll((els) => els.map((e) => e.id || e.className));
    expect(order.findIndex((x) => String(x).includes("book-tours"))).toBeLessThan(order.findIndex((x) => String(x).includes("quicknav")));
    expect(documents(env)).toEqual([]);
  });
});

test.describe("marketplace filter column", () => {
  test("the large filter column is not shown at any width; search and category buttons remain", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    await expect(cards(page).first()).toBeVisible();
    await expect(page.locator(".mk-filters")).toBeHidden();
    await expect(page.getByRole("button", { name: /Filters & sort/ })).toBeHidden();
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Tour categories" }).getByRole("link").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});

test.describe("marketplace without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("renders results and filters through a plain GET form", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    await expect(cards(page).first()).toBeVisible();
    // The filter form is kept in the markup (hidden), so it still works as a plain GET form; here the same URL is opened directly.
    await expect(page.locator("form.mk-filters")).toHaveAttribute("method", "get");
    await page.goto("/tours?provider=tiqets");
    await expect(page).not.toHaveURL(/cursor/);
    const providers = await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-provider")));
    expect(new Set(providers)).toEqual(new Set(["tiqets"]));
  });
});

test.describe("editorial pages", () => {
  test("the danube experience shows a few live cruises with internal links and a See all link", async ({ page }) => {
    const env = await prepare(page);
    await page.goto("/experiences/danube");
    const row = page.getByTestId("contextual-tours");
    await row.scrollIntoViewIfNeeded();
    await expect(row.locator(".mk-card").first()).toBeVisible();
    expect(await row.locator(".mk-card").count()).toBeLessThanOrEqual(6);
    // The only external links are the licence/source credit links under an editorial venue photo.
    await expect(row.locator('a[href^="http"]:not(.mk-venue-credit a)')).toHaveCount(0);
    await expect(row.getByRole("link", { name: /See all tours/ })).toHaveAttribute("href", /\/tours\?.*category=cruises/);
    expect(documents(env)).toEqual([]);
  });
});

// ------------------------------------------------------------------- Tiqets product page
type Log = { method: string; path: string }[];
const tiqetsLog = async (): Promise<Log> => (await fetch(`${MOCK}/__log/__tiqets`)).json();
const rawDetail = async (id: number) =>
  ((await (await fetch(`${MOCK}/__tiqets/v2/products/${id}`)).json()) as { product: { product_url: string } }).product;

test.describe("Tiqets product page", () => {
  test("shows full supplier details, availability and a byte-for-byte final hand-off", async ({ page }) => {
    const env = await prepare(page);
    const res = await page.goto("/tours/tiqets/5002");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("St. Stephen's Basilica: Entry Ticket");
    await expect(page.getByRole("heading", { name: "About this ticket" })).toBeVisible();
    await expect(page.getByText("Audio guide available in several languages.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What is included" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Not included" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Opening information" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Good to know" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Availability" })).toBeVisible();
    await expect(page.getByText("Adult")).toBeVisible();
    await expect(page.locator(".mk-dates li").first()).toBeVisible();
    await expect(page.locator(".mk-dates li.mk-soldout")).toHaveCount(1);
    // No invented discount, no unlicensed supplier image, text only.
    await expect(page.locator("main")).not.toContainText(/99|50%|discount/i);
    expect(await page.locator("main img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))).not.toContainEqual(
      expect.stringContaining("images.example.com"),
    );
    // The hand-off is the final step: the exact API URL, opened in a new tab, last in the DOM order.
    const cta = page.getByRole("link", { name: /Continue to Tiqets/ });
    await expect(cta).toHaveCount(1);
    expect((await cta.getAttribute("href")) as string).toBe((await rawDetail(5002)).product_url);
    await expect(cta).toHaveAttribute("rel", /sponsored/);
    await expect(page.getByText(/may need to be chosen again/)).toBeVisible();
    expect(documents(env)).toEqual([]);
  });

  test("the mock Tiqets log shows only read-only catalogue, detail and availability GETs", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours/tiqets/5003");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const log = await tiqetsLog();
    expect(log.length).toBeGreaterThan(0);
    for (const e of log) {
      expect(e.method).toBe("GET");
      expect(e.path).toMatch(/^\/__tiqets\/v2\/(cities|products(\/\d{1,12}(\/availability)?)?)(\?.*)?$/);
      expect(e.path).not.toMatch(/order|booking|reserv|hold|payment|checkout|cart/i);
    }
  });

  test("an unknown product, a foreign city and a malformed detail are handled", async ({ page }) => {
    await prepare(page);
    expect((await page.goto("/tours/tiqets/6001"))?.status()).toBe(404);
    expect((await page.goto("/tours/tiqets/6006"))?.status()).toBe(404);
    expect((await page.goto("/tours/tiqets/abc"))?.status()).toBe(404);
    expect((await page.goto("/tours/tiqets/6005"))?.status()).toBe(200);
    await expect(page.locator("main [role=alert]")).toContainText("could not load the Tiqets product");
    await expect(page.getByRole("link", { name: /Continue to Tiqets/ })).toHaveCount(0);
  });

  test("availability problems keep the page usable and say so", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours/tiqets/6002");
    await expect(page.getByText(/not available through our Tiqets account/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue to Tiqets/ })).toBeVisible();
    await page.goto("/tours/tiqets/6003");
    await expect(page.getByText(/reports no available dates/)).toBeVisible();
    await page.goto("/tours/tiqets/6004");
    await expect(page.getByText(/could not be loaded/)).toBeVisible();
    await page.goto("/tours/tiqets/6009");
    await expect(page.getByText(/not available through our Tiqets account/)).toBeVisible();
    await page.goto("/tours/tiqets/6010");
    await expect(page.getByText(/not selling this product/)).toBeVisible();
  });

  test("a product with no optional fields shows no invented sections and a text-led layout", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours/tiqets/6007");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minimal Budapest Ticket");
    await expect(page.getByText("Tiqets has not supplied a description")).toBeVisible();
    for (const h of ["Highlights", "What is included", "Not included", "Opening information", "Good to know"])
      await expect(page.getByRole("heading", { name: h })).toHaveCount(0);
    await expect(page.locator(".mk-facts li")).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("a product that is not on sale offers no hand-off", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours/tiqets/6008");
    await expect(page.getByText(/does not currently list this product for sale/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue to Tiqets/ })).toHaveCount(0);
  });
});
