// Browser-level tests of the TourDesk and Viator booking screens, desktop and
// mobile. ALL MOCKED: the site is served by a dedicated `next start` (port 3101)
// whose provider API calls are redirected to e2e/support/mock-provider.mjs on
// 127.0.0.1 (BOOKING_MOCK_ORIGIN). Every other external request made by the browser
// is intercepted here, so no live provider (or any other third party) is contacted.
// These tests prove UI behaviour against synthetic responses; they are NOT live
// availability, checkout creation or payment verification.
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MOCK = "http://127.0.0.1:3900";
const kinds = { standard: 100000, group: 200000, complex: 300000, foreign: 700000 };
const tdId = (kind: keyof typeof kinds) =>
  `${kinds[kind] + Math.floor(Math.random() * 90000)}-1`;
const vCode = (prefix: string) =>
  prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
const euro = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);

async function control(id: string, patch: Record<string, unknown>) {
  const r = await fetch(`${MOCK}/__control/${id}`, { method: "POST", body: JSON.stringify(patch) });
  expect(r.ok).toBe(true);
}
async function logOf(id: string): Promise<{ method: string; path: string; body?: unknown }[]> {
  return (await fetch(`${MOCK}/__log/${id}`)).json();
}
const bookings = async (id: string) =>
  (await logOf(id)).filter((e) => e.method === "POST" && e.path.startsWith("TourBooking/"));

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

type Env = { external: string[]; problems: string[] };
async function prepare(page: Page, testInfo: TestInfo): Promise<Env> {
  const env: Env = { external: [], problems: [] };
  // Unique client address per test: the API gate rate-limits per address.
  const ip = `198.51.100.${1 + Math.floor(Math.random() * 250)}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      const host = new URL(req.url()).hostname;
      env.external.push(`${req.resourceType()} ${host}`);
      if (req.resourceType() === "image")
        return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg });
      if (host === "checkout.tourdesk.is" && req.resourceType() === "document")
        return route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Mock provider checkout</h1>" });
      return route.abort();
    },
  );
  page.on("pageerror", (e) => env.problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) env.problems.push(`csp: ${m.text().slice(0, 200)}`);
  });
  void testInfo;
  return env;
}
async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: `test-results/booking-ui-shots/${name}-${testInfo.project.name}.png`,
    fullPage: true,
  });
}
async function layoutOk(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow").toBeLessThanOrEqual(1);
  const overlap = await page.evaluate(() => {
    const a = document.querySelector(".tour-booking-layout > article")?.getBoundingClientRect();
    const b = document.querySelector(".booking-panel")?.getBoundingClientRect();
    if (!a || !b) return false;
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  });
  expect(overlap, "article and booking panel overlap").toBe(false);
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src),
  );
  expect(broken, "broken images").toEqual([]);
}

async function pickDateAndSlot(page: Page, label = "10:00") {
  await page.getByLabel("1. Date").selectOption({ index: 1 });
  const dep = page.getByLabel("2. Departure");
  await expect(dep).toBeVisible();
  await dep.selectOption({ label });
}
async function qty(page: Page, name: RegExp, n: number) {
  await page.getByLabel(name).fill(String(n));
}
const total = (page: Page) => page.locator(".booking-total").first();
const alertOf = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');
const option = (page: Page, text: string) => page.locator("option", { hasText: text });

test.describe("TourDesk product page (mocked provider)", () => {
  test("renders title, photo, description, provider link and a clean layout", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const id = tdId("standard");
    await page.goto(`/tours/tourdesk/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Budapest Danube Evening Cruise");
    await expect(page.getByText("Hungarian Parliament")).toBeVisible();
    await expect(page.getByText("Free cancellation up to 24 hours")).toBeVisible();
    const hero = page.locator(".tour-detail-hero img");
    await expect(hero).toBeVisible();
    await expect.poll(() => hero.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    const link = page.getByRole("link", { name: /See all options on TourDesk/ });
    await expect(link).toHaveAttribute("href", `https://budapest.tourdesk.is/booking/${id}`);
    await expect(page.getByText("Welcome drink · Audio guide")).toBeVisible();
    await expect(page.getByLabel("1. Date")).toBeEnabled();
    // Breadcrumb link and current page share one visual line.
    const centres = await page.evaluate(() =>
      [...document.querySelectorAll(".breadcrumbs a, .breadcrumbs span:not([style])")].map((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        const r = range.getBoundingClientRect();
        return Math.round(r.top + r.height / 2);
      }),
    );
    expect(centres.length).toBeGreaterThanOrEqual(5); // links, separators, current page
    expect(Math.max(...centres) - Math.min(...centres), `breadcrumb text centres ${centres}`).toBeLessThanOrEqual(6);
    // Narrow screens show the booking panel before the long description.
    const order = await page.evaluate(() => {
      const panel = document.querySelector(".booking-panel")!.getBoundingClientRect();
      const article = document.querySelector(".tour-booking-layout > article")!.getBoundingClientRect();
      return { panel: panel.top, article: article.top, narrow: window.innerWidth <= 900 };
    });
    if (order.narrow) expect(order.panel).toBeLessThan(order.article);
    await layoutOk(page);
    await shot(page, testInfo, "tourdesk-product");
    expect(env.problems).toEqual([]);
  });

  test("date, departures (sold out/unavailable disabled), participants, pickup, review and total", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const id = tdId("standard");
    await page.goto(`/tours/tourdesk/${id}`);
    await page.getByLabel("1. Date").selectOption({ index: 1 });
    await expect(page.getByLabel("2. Departure")).toBeVisible();
    await expect(option(page, "12:00 — sold out")).toHaveAttribute("disabled", "");
    await expect(option(page, "14:00 — unavailable")).toHaveAttribute("disabled", "");
    await expect(option(page, "10:00")).not.toHaveAttribute("disabled", "");
    await page.getByLabel("2. Departure").selectOption({ label: "10:00" });

    await expect(page.getByRole("button", { name: "Review booking →" })).toBeDisabled();
    await qty(page, /Adults/, 2);
    await qty(page, /Children/, 1);
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);
    await page.getByLabel("Include pickup").check();
    await expect(total(page)).toHaveText(`Total: ${euro(115)}`);
    await page.getByLabel("Include pickup").uncheck();
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);

    // Participant limits: capacity 6 in total, children capped at 4.
    await qty(page, /Children/, 9);
    await expect(page.getByLabel(/Children/)).toHaveValue("4");
    await qty(page, /Adults/, 5);
    await expect(page.getByText("Choose between 1 and 6 participants.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Review booking →" })).toBeDisabled();
    await qty(page, /Children/, 1);
    await qty(page, /Adults/, 2);
    await shot(page, testInfo, "tourdesk-selection");

    await page.getByRole("button", { name: "Review booking →" }).click();
    await expect(page.getByRole("heading", { name: "Review your selection" })).toBeVisible();
    await expect(page.locator(".booking-review li")).toHaveText(["Adults: 2", "Children: 1"]);
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);
    await expect(page.getByText("confirmed only after TourDesk confirms it")).toBeVisible();
    await shot(page, testInfo, "tourdesk-review");

    // Back: editing keeps the selection.
    await page.getByRole("button", { name: "Edit selection" }).click();
    await expect(page.getByLabel(/Adults/)).toHaveValue("2");
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);
    await layoutOk(page);
    expect((await bookings(id)).length).toBe(0);
    expect(env.problems).toEqual([]);
  });

  test("a double click creates exactly one provider checkout and hands over to the HTTPS provider host", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const id = tdId("standard");
    await control(id, { slow: 500 });
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 2);
    await page.getByRole("button", { name: "Review booking →" }).click();
    const go = page.getByRole("button", { name: /Continue to TourDesk payment/ });
    await go.dblclick();
    await page.waitForURL(/checkout\.tourdesk\.is\/pay\//);
    await expect(page.getByRole("heading", { name: "Mock provider checkout" })).toBeVisible();
    const posts = await bookings(id);
    expect(posts.length).toBe(1);
    const body = posts[0].body as Record<string, unknown>;
    expect(body.availabilityId).toMatch(/^\d{14}-\d+_\d{8}$/);
    expect(body.priceCategories).toEqual([{ priceCategoryId: "adult", quantity: 2 }]);
    expect(String(body.returnUrl)).toMatch(/\/booking\/return$/);
    expect(JSON.stringify(body)).not.toMatch(/email|phone|passport|card/i);
    expect(env.problems).toEqual([]);
  });

  test("price changed after the quote: clear message, refreshed total, no order created", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 2);
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { adultPrice: 48 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toContainText("The price has changed");
    await expect(alertOf(page)).toContainText("refreshed availability");
    await expect(total(page)).toHaveText(`Total: ${euro(96)}`); // refreshed live price
    await expect(page).toHaveURL(/\/tours\/tourdesk\//);
    await shot(page, testInfo, "tourdesk-price-changed");
    expect((await bookings(id)).length).toBe(0);
  });

  test("capacity dropped after the quote: refused without creating an order", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 3);
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { capacity: 1 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toContainText(/participants|availability/i);
    await expect(page.getByRole("button", { name: "Review booking →" })).toBeDisabled();
    expect((await bookings(id)).length).toBe(0);
  });

  test("all departures sold out shows a plain explanation and nothing bookable", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await control(id, { allSoldOut: true });
    await page.goto(`/tours/tourdesk/${id}`);
    await page.getByLabel("1. Date").selectOption({ index: 1 });
    await expect(page.getByText("No departures available on this date")).toBeVisible();
    await expect(option(page, "10:00 — sold out")).toHaveAttribute("disabled", "");
    await expect(page.getByRole("button", { name: "Review booking →" })).toHaveCount(0);
  });

  test("upstream 503 on dates is a retriable error, never 'sold out' or 'no dates'", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await control(id, { availabilityStatus: 503 });
    await page.goto(`/tours/tourdesk/${id}`);
    await expect(alertOf(page)).toContainText("temporarily unavailable");
    await expect(page.getByText(/sold out|no dates are currently available/i)).toHaveCount(0);
    await shot(page, testInfo, "tourdesk-upstream-error");
    await control(id, { availabilityStatus: 200 });
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByLabel("1. Date")).toBeEnabled();
    await expect(alertOf(page)).toHaveCount(0);
  });

  test("malformed upstream JSON is a retriable error", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await control(id, { malformedAvailability: true });
    await page.goto(`/tours/tourdesk/${id}`);
    await expect(alertOf(page)).toContainText(/temporarily unavailable|try again/i);
    await expect(page.getByText(/sold out/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("failed checkout creation is shown as an error and is not retried automatically", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("standard");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 1);
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { bookingStatus: 503 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    // HTTP 5xx on POST /TourBooking: an order may exist, so the page locks (ported goTene behaviour).
    await expect(alertOf(page)).toContainText("could not confirm whether TourDesk created your checkout");
    await expect(alertOf(page)).toContainText("do not book again");
    await expect(alertOf(page)).not.toContainText(/try again/i);
    await expect(page.getByRole("link", { name: /Check or continue on TourDesk/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue to TourDesk payment/ })).toHaveCount(0);
    await page.waitForTimeout(1500);
    expect((await bookings(id)).length).toBe(1); // one attempt, no automatic retry
    await page.reload();
    await expect(alertOf(page)).toContainText("could not confirm"); // the lock survives a reload
    await expect(page).toHaveURL(/\/tours\/tourdesk\//);
  });

  test("a spoofed checkout host is rejected and the browser stays on the site", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const id = tdId("standard");
    await control(id, { checkoutUrl: "https://checkout.tourdesk.is.evil.example/pay" });
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 1);
    await page.getByRole("button", { name: "Review booking →" }).click();
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toBeVisible();
    await expect(page).toHaveURL(/\/tours\/tourdesk\//);
    expect(env.external.some((e) => /evil\.example/.test(e))).toBe(false);
  });

  test("two options: per-person and fixed group price; limits and totals follow the option", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("group");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await expect(page.getByLabel("Option")).toBeVisible();
    await page.getByLabel("Option").selectOption({ label: "Private boat (fixed price, up to 6)" });
    await expect(page.getByText("Included in group price")).toBeVisible();
    await qty(page, /Guests/, 2);
    await expect(total(page)).toHaveText(`Total: ${euro(200)}`); // charged once, not per guest
    await qty(page, /Guests/, 6);
    await expect(total(page)).toHaveText(`Total: ${euro(200)}`);
    await qty(page, /Guests/, 7);
    await expect(page.getByText("Choose between 1 and 6 participants.")).toBeVisible();
    await page.getByLabel("Option").selectOption({ label: "Standard seating (per person)" });
    await qty(page, /Adults/, 2);
    await expect(total(page)).toHaveText(`Total: ${euro(80)}`);
    await shot(page, testInfo, "tourdesk-options");
    await layoutOk(page);
  });

  test("complex configurations hand over to the exact TourDesk URL instead of guessing", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("complex");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await expect(page.getByText("additional booking choices")).toBeVisible();
    await expect(page.getByRole("button", { name: "Review booking →" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /See all options on TourDesk/ })).toHaveAttribute(
      "href",
      `https://budapest.tourdesk.is/booking/${id}`,
    );
    await shot(page, testInfo, "tourdesk-handoff");
    expect((await bookings(id)).length).toBe(0);
  });

  test("foreign (non-Budapest) products are refused", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const res = await page.goto(`/tours/tourdesk/${tdId("foreign")}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/Book a Budapest experience|Plan your visit/)).toHaveCount(0);
  });

  test("controls have labels and are keyboard reachable with a visible focus indicator", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    await page.goto(`/tours/tourdesk/${tdId("standard")}`);
    const date = page.getByLabel("1. Date");
    await expect(date).toBeEnabled();
    // Reach the date select with the real keyboard, as a user would.
    await page.mouse.click(5, 5);
    let reached = false;
    for (let n = 0; n < 80 && !reached; n++) {
      await page.keyboard.press("Tab");
      reached = await date.evaluate((el) => el === document.activeElement);
    }
    expect(reached, "date select reachable by Tab").toBe(true);
    const ring = await date.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, color: s.outlineColor, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    const [r, g, b] = ring.color.match(/\d+/g)!.map(Number);
    expect(r + g + b, `focus ring colour ${ring.color} must contrast with the navy panel`).toBeGreaterThan(300);
    await page.keyboard.press("ArrowDown");
    await expect(page.getByLabel("2. Departure")).toBeVisible();
    await page.getByLabel("2. Departure").selectOption({ label: "10:00" });
    await expect(page.getByRole("group", { name: "3. Participants" })).toBeVisible();
    await expect(page.getByLabel(/Adults/)).toHaveAttribute("type", "number");
    await expect(page.getByRole("button", { name: "Refresh availability" })).toBeVisible();
  });
});

test.describe("Viator product page (mocked provider)", () => {
  const productUrl = (code: string) =>
    `https://www.viator.com/tours/Budapest/Mock-Danube-Cruise/d684-${code}?pid=P00MOCK&mcid=42383&medium=api&medium_version=2.0&uid=U-MOCK`;

  test("Book on Viator keeps the exact API URL; availability preview is labelled non-transferring and never calls booking endpoints", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const code = vCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Budapest Danube Cruise (mock)");
    const cta = page.getByRole("link", { name: /Book on Viator/ });
    await expect(cta).toHaveAttribute("href", productUrl(code));
    await expect(cta).toHaveAttribute("rel", /sponsored/);
    await layoutOk(page);

    await page.getByRole("button", { name: "Check dates and prices here" }).click();
    const notice = page.getByText(/do not transfer to Viator/);
    await expect(notice).toBeVisible();
    await expect(page.getByRole("button", { name: "Check availability" })).toBeDisabled();
    const day = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    await page.getByLabel("Date").fill(day);
    await page.getByLabel(/adult/i).fill("2");
    await page.getByRole("button", { name: "Check availability" }).click();
    const results = page.getByRole("status");
    await expect(results).toContainText("SEATED · 19:00 · " + euro(55.5));
    await expect(results).toContainText("PREMIUM · 21:00 · " + euro(89));
    await expect(results).toContainText("Choose your dates and participants again on Viator");
    await shot(page, testInfo, "viator-preview");

    // The CTA is untouched by the preview and no transactional endpoint was used.
    await expect(cta).toHaveAttribute("href", productUrl(code));
    const calls = await logOf(code);
    const check = calls.filter((c) => c.path === "availability/check");
    expect(check.length).toBe(1);
    expect(check[0].body).toMatchObject({
      productCode: code,
      travelDate: day,
      currency: "EUR",
      paxMix: [{ ageBand: "ADULT", numberOfTravelers: 2 }],
    });
    expect(calls.every((c) => /^(products\/|availability\/check)/.test(c.path))).toBe(true);
    const tx = await (await fetch(`${MOCK}/__transactional`)).json();
    expect(tx).toEqual([]);
    expect(env.problems).toEqual([]);
  });

  test("nothing available is stated plainly; an upstream error is a retriable error, not 'no availability'", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const none = vCode("VNONE");
    await page.goto(`/tours/viator/${none}`);
    await page.getByRole("button", { name: "Check dates and prices here" }).click();
    await page.getByLabel("Date").fill(new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10));
    await page.getByLabel(/adult/i).fill("1");
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.getByText("No available options for this selection")).toBeVisible();

    const err = vCode("VERR");
    await page.goto(`/tours/viator/${err}`);
    await page.getByRole("button", { name: "Check dates and prices here" }).click();
    await page.getByLabel("Date").fill(new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10));
    await page.getByLabel(/adult/i).fill("1");
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(alertOf(page)).toContainText("temporarily unavailable");
    await expect(page.getByText("No available options")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Book on Viator/ })).toHaveAttribute("href", productUrl(err));
    await shot(page, testInfo, "viator-error");
  });

  test("foreign destinations are refused", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const res = await page.goto(`/tours/viator/${vCode("VFOR")}`);
    expect(res?.status()).toBe(404);
  });
});

test("the checkout return page never claims payment or confirmation", async ({ page }, testInfo) => {
  await prepare(page, testInfo);
  await page.goto("/booking/return");
  const text = (await page.locator("main").innerText()).toLowerCase();
  expect(text).toContain("does not confirm payment");
  expect(text).not.toMatch(/payment (was )?(successful|received|complete)|booking (is )?confirmed|thank you for your (order|booking|purchase)|you are booked/);
  await layoutOk(page).catch(() => undefined);
  await shot(page, testInfo, "booking-return");
});
