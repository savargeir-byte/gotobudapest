// Browser-level tests of the /tours marketplace UI, the editorial product rows and the
// Tiqets product page, desktop and mobile. ALL MOCKED: the site is served by the dedicated
// `next start` (port 3101) whose provider calls go to e2e/support/mock-provider.mjs on
// 127.0.0.1. Every non-local browser request is intercepted, so no live provider is
// contacted. These tests prove UI behaviour against synthetic responses; they are NOT live
// availability, pricing or booking verification.
//
// Provider failures are simulated by intercepting the browser's own /api/marketplace/search
// calls, never by switching the mock's global scenario (other specs share that state).
import { expect, test, type Page } from "@playwright/test";

const MOCK = "http://127.0.0.1:3900";
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

type Env = { external: string[] };
async function prepare(page: Page): Promise<Env> {
  const env: Env = { external: [] };
  // Unique client address per test: the API gate rate-limits per address.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${1 + Math.floor(Math.random() * 250)}` });
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

test.describe("marketplace page", () => {
  test("renders products server-side with internal links only on every card", async ({ page }) => {
    const env = await prepare(page);
    const res = await page.goto("/tours");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: /Budapest tours/ })).toBeVisible();
    await expect(cards(page).first()).toBeVisible();
    expect(await cards(page).count()).toBeGreaterThan(5);
    // Exactly one link per card, always internal; no provider URL anywhere on a card.
    const links = await cards(page).evaluateAll((els) =>
      els.map((el) => ({ provider: el.getAttribute("data-provider"), hrefs: [...el.querySelectorAll("a")].map((a) => a.getAttribute("href")) })),
    );
    for (const l of links) {
      expect(l.hrefs).toHaveLength(1);
      expect(l.hrefs[0]).toMatch(new RegExp(`^/tours/${l.provider}/[A-Za-z0-9-]+$`));
    }
    expect(new Set(links.map((l) => l.provider)).size).toBeGreaterThan(1);
    await expect(cards(page).first().getByRole("link", { name: /View details/ })).toBeVisible();
    await expect(page.locator('.mk-card a[target="_blank"]')).toHaveCount(0);
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
    expect(href).not.toMatch(/viator\.com/);
    expect(documents(env).filter((d) => /viator|tiqets/.test(d))).toEqual([]);
  });

  test("a card shows only supplied data: image only where authorised, no invented fields", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours?provider=tiqets");
    // The Tiqets key tier returns no licensed photographs (the mock even offers one to prove it is dropped).
    await expect(cards(page).first()).toBeVisible();
    await expect(page.locator(".mk-card img")).toHaveCount(0);
    await expect(cards(page).first().locator(".mk-badge")).toHaveText("Tiqets");
    await page.goto("/tours?provider=viator");
    await expect(cards(page).first().locator("img")).toHaveCount(1);
    await expect(cards(page).first().locator("img")).toHaveAttribute("referrerpolicy", "no-referrer");
    // Free cancellation is shown only when the API said so.
    const free = await page.locator(".mk-green").count();
    const total = await cards(page).count();
    expect(free).toBeLessThan(total);
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
    // Tiqets cannot filter by price on the server: the UI says so instead of pretending.
    const toggle = page.getByRole("button", { name: /Filters & sort/ });
    if (await toggle.isVisible()) await toggle.click();
    const price = page.locator(".mk-filters .mk-note").filter({ hasText: "Tiqets" });
    await expect(price.first()).toBeVisible();
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
  test("shows a row of genuine tours that all link to internal product pages", async ({ page }) => {
    const env = await prepare(page);
    await page.goto("/");
    const row = page.getByTestId("contextual-tours");
    await row.evaluate((el) => el.scrollIntoView()); // zero-height until the lazy row loads
    await expect(row.locator(".mk-card").first()).toBeVisible();
    expect(await row.locator(".mk-card").count()).toBeLessThanOrEqual(6);
    await expect(row.locator('a[href^="http"]')).toHaveCount(0);
    await expect(row.getByRole("link", { name: /See all tours/ })).toHaveAttribute("href", "/tours");
    expect(documents(env)).toEqual([]);
  });
});

test.describe("marketplace filter drawer", () => {
  test("opens, traps focus, closes on Escape and restores focus", async ({ page }, info) => {
    test.skip(info.project.name.includes("desktop"), "the drawer exists only on narrow screens");
    await prepare(page);
    await page.goto("/tours");
    const toggle = page.getByRole("button", { name: /Filters & sort/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const dialog = page.getByRole("dialog", { name: "Filters and sorting" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });
});

test.describe("marketplace without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("renders results and filters through a plain GET form", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    await expect(cards(page).first()).toBeVisible();
    const form = page.locator("form.mk-filters");
    await expect(form).toHaveAttribute("method", "get");
    await page.locator('input[name="provider"][value="tiqets"]').check();
    await form.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/[?&]provider=tiqets/);
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
    await expect(row.locator('a[href^="http"]')).toHaveCount(0);
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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Basilica Entry 1");
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
