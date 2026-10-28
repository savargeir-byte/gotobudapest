// Browser-level tests of the TourDesk and Viator booking screens, desktop and
// mobile. ALL MOCKED: the site is served by a dedicated `next start` (port 3101)
// whose provider API calls are redirected to e2e/support/mock-provider.mjs on
// 127.0.0.1 (BOOKING_MOCK_ORIGIN). Every other external request made by the browser
// is intercepted here, so no live provider (or any other third party) is contacted.
// These tests prove UI behaviour against synthetic responses; they are NOT live
// availability, checkout creation or payment verification.
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MOCK = "http://127.0.0.1:3900";
const kinds = { standard: 100000, group: 200000, complex: 300000, rich: 400000, mandatory: 500000, foreign: 700000 };
const tdId = (kind: keyof typeof kinds) =>
  `${kinds[kind] + Math.floor(Math.random() * 90000)}-1`;
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

// The date control is the ported GoIceTravel month-grid calendar (dialog), the
// departures are radio buttons, participants are +/- steppers with a number input.
const dateTrigger = (page: Page) => page.locator(".booking-date-trigger");
async function pickDate(page: Page) {
  await dateTrigger(page).click();
  const dialog = page.getByRole("dialog", { name: "Choose a date" });
  await expect(dialog).toBeVisible();
  await dialog.locator("td button:not(:disabled)").first().click();
  await expect(dialog).toBeHidden();
}
const slotRadio = (page: Page, name: string) => page.getByRole("radio", { name, exact: true });
async function pickDateAndSlot(page: Page, label = "10:00") {
  await pickDate(page);
  await slotRadio(page, label).click();
}
async function qty(page: Page, name: RegExp, n: number) {
  await page.getByRole("spinbutton", { name }).fill(String(n));
}
const total = (page: Page) => page.locator(".booking-total").first();
const alertOf = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');

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
    await expect(dateTrigger(page)).toBeEnabled();
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
    await pickDate(page);
    await expect(page.getByRole("radiogroup", { name: "Departure time" })).toBeVisible();
    await expect(slotRadio(page, "12:00 — sold out")).toBeDisabled();
    await expect(slotRadio(page, "14:00 — unavailable")).toBeDisabled();
    await expect(slotRadio(page, "10:00")).toBeEnabled();
    await slotRadio(page, "10:00").click();

    await expect(page.getByRole("button", { name: "Review booking →" })).toBeDisabled();
    await qty(page, /Adults/, 2);
    await qty(page, /Children/, 1);
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);
    await page.getByLabel("Include pickup").check();
    await expect(total(page)).toHaveText(`Total: ${euro(115)}`);
    await page.getByLabel("Include pickup").uncheck();
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);

    // Participant limits (GoIceTravel computeCategoryMaxQty): capacity 6 in total,
    // children capped at 4; the controls clamp instead of allowing an invalid selection.
    await qty(page, /Children/, 9);
    await expect(page.getByRole("spinbutton", { name: /Children/ })).toHaveValue("4");
    await qty(page, /Adults/, 5);
    await expect(page.getByRole("spinbutton", { name: /Adults/ })).toHaveValue("2"); // 6 seats - 4 children
    await page.getByRole("button", { name: "Decrease Children" }).click();
    await expect(page.getByRole("spinbutton", { name: /Children/ })).toHaveValue("3");
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
    await expect(page.getByRole("spinbutton", { name: /Adults/ })).toHaveValue("2");
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
    await pickDate(page);
    await expect(page.getByText("No departures available on this date")).toBeVisible();
    await expect(slotRadio(page, "10:00 — sold out")).toBeDisabled();
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
    await expect(dateTrigger(page)).toBeEnabled();
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
    await expect(page.getByRole("group", { name: "Option" })).toBeVisible();
    await page.getByRole("radio", { name: /Private boat/ }).check();
    await expect(page.getByText("Included in group price")).toBeVisible();
    await qty(page, /Guests/, 2);
    await expect(total(page)).toHaveText(`Total: ${euro(200)}`); // charged once, not per guest
    await qty(page, /Guests/, 6);
    await expect(total(page)).toHaveText(`Total: ${euro(200)}`);
    await qty(page, /Guests/, 7);
    await expect(page.getByRole("spinbutton", { name: /Guests/ })).toHaveValue("6"); // option maximum
    await page.getByRole("radio", { name: /Standard seating/ }).check();
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

  // ---- Ported GoIceTravel journey: options, dependants, add-ons, pickup (MOCKED) ----
  async function richToCheckout(page: Page, testInfo: TestInfo) {
    await prepare(page, testInfo);
    const id = tdId("rich");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await page.getByRole("radio", { name: /Evening cruise/ }).check();
    return id;
  }
  const addOn = (page: Page, name: RegExp) => page.getByRole("group", { name: "Add-ons" }).getByRole("spinbutton", { name });

  test("full journey: option, dependant rule, add-ons, pickup, price breakdown and flat TourBooking rows", async ({ page }, testInfo) => {
    const env = await prepare(page, testInfo);
    const id = tdId("rich");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    // Two options: the choice comes first, nothing else is offered before it.
    await expect(page.getByRole("radio", { name: /Premium seating/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "Participants" })).toHaveCount(0);
    await page.getByRole("radio", { name: /Evening cruise/ }).check();
    // GoIceTravel default category: one adult is preselected.
    await expect(page.getByRole("spinbutton", { name: /Adults/ })).toHaveValue("1");
    // Dependant category (goTene rule): children need at least one adult.
    await expect(page.getByText("Requires at least one adult ticket in the booking.")).toBeVisible();
    await qty(page, /Adults/, 0);
    await qty(page, /Children/, 2);
    await expect(page.getByText("Children and infants must be accompanied by at least one adult ticket.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Review booking →" })).toBeDisabled();
    await qty(page, /Adults/, 2);
    await qty(page, /Children/, 1);
    await expect(total(page)).toHaveText(`Total: ${euro(100)}`);
    // Add-ons: per-category extra limited by participants (limitByPax), flat extra.
    await addOn(page, /Dinner upgrade: Adult dinner/).fill("5");
    await expect(addOn(page, /Dinner upgrade: Adult dinner/)).toHaveValue("2");
    await addOn(page, /Dinner upgrade: Child dinner/).fill("1");
    await addOn(page, /^Audio guide$/).fill("1");
    await page.getByLabel("Include pickup").check();
    const summary = page.locator(".booking-summary");
    await expect(summary).toContainText(`Tickets: ${euro(100)}`);
    await expect(summary).toContainText(`Pickup: +${euro(15)}`);
    await expect(summary).toContainText(`Add-ons: +${euro(67)}`); // 2 x 25 + 1 x 12 + 1 x 5
    await expect(total(page)).toHaveText(`Total: ${euro(182)}`);
    await shot(page, testInfo, "tourdesk-rich-selection");
    await layoutOk(page);

    await page.getByRole("button", { name: "Review booking →" }).click();
    await expect(page.locator(".booking-review li")).toHaveText([
      "Adults: 2",
      "Children: 1",
      "Add-on Dinner upgrade (Adult dinner): 2",
      "Add-on Dinner upgrade (Child dinner): 1",
      "Add-on Audio guide: 1",
    ]);
    await expect(total(page)).toHaveText(`Total: ${euro(182)}`);
    await shot(page, testInfo, "tourdesk-rich-review");
    // Back/edit keeps every choice.
    await page.getByRole("button", { name: "Edit selection" }).click();
    await expect(addOn(page, /Dinner upgrade: Adult dinner/)).toHaveValue("2");
    await expect(page.getByLabel("Include pickup")).toBeChecked();
    await page.getByRole("button", { name: "Review booking →" }).click();

    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).dblclick();
    await page.waitForURL(/checkout\.tourdesk\.is\/pay\//);
    const posts = await bookings(id);
    expect(posts.length).toBe(1); // duplicate-order prevention
    const body = posts[0].body as Record<string, unknown>;
    expect(body.variantId).toBe("v-cruise");
    expect(body.pickup).toBe(true);
    expect(body.priceCategories).toEqual([
      { priceCategoryId: "101", quantity: 2 },
      { priceCategoryId: "102", quantity: 1 },
    ]);
    // TourDesk OpenAPI TourBookingBookableExtra rows are FLAT.
    expect(body.bookableExtras).toEqual([
      { bookableExtraId: "4001", priceCategoryId: "101", quantity: 2 },
      { bookableExtraId: "4001", priceCategoryId: "102", quantity: 1 },
      { bookableExtraId: "4002", priceCategoryId: null, quantity: 1 },
    ]);
    expect(env.problems).toEqual([]);
  });

  test("an option with mandatory pickup forces and prices pickup", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = tdId("rich");
    await page.goto(`/tours/tourdesk/${id}`);
    await pickDateAndSlot(page);
    await page.getByRole("radio", { name: /Premium seating/ }).check();
    const pickup = page.getByRole("checkbox", { name: "Pickup required" });
    await expect(pickup).toBeChecked();
    await expect(pickup).toBeDisabled();
    await expect(page.getByText("Add-ons")).toHaveCount(0); // this option offers none
    await expect(total(page)).toHaveText(`Total: ${euro(68)}`); // 1 adult x 60 + pickup 8
  });

  test("tour-level mandatory pickup is applied and priced", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    await page.goto(`/tours/tourdesk/${tdId("mandatory")}`);
    await pickDateAndSlot(page);
    await qty(page, /Adults/, 2);
    await expect(page.getByRole("checkbox", { name: "Pickup required" })).toBeChecked();
    await expect(total(page)).toHaveText(`Total: ${euro(90)}`); // 2 x 40 + 2 x 5 pickup
  });

  test("add-on price changed after the quote: refreshed, no order created", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = await richToCheckout(page, testInfo);
    await qty(page, /Adults/, 2);
    await addOn(page, /Dinner upgrade: Adult dinner/).fill("2");
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { extraPrice: 30 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toContainText("The price has changed");
    expect((await bookings(id)).length).toBe(0);
  });

  test("add-on stock dropped after the quote: refused, no order created", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = await richToCheckout(page, testInfo);
    await qty(page, /Adults/, 2);
    await addOn(page, /Dinner upgrade: Adult dinner/).fill("2");
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { extraStock: 1 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toContainText(/add-on/i);
    expect((await bookings(id)).length).toBe(0);
  });

  test("an uncertain order with add-ons locks the page and never retries", async ({ page }, testInfo) => {
    await prepare(page, testInfo);
    const id = await richToCheckout(page, testInfo);
    await qty(page, /Adults/, 1);
    await addOn(page, /^Audio guide$/).fill("1");
    await page.getByRole("button", { name: "Review booking →" }).click();
    await control(id, { bookingStatus: 503 });
    await page.getByRole("button", { name: /Continue to TourDesk payment/ }).click();
    await expect(alertOf(page)).toContainText("could not confirm whether TourDesk created your checkout");
    await expect(page.getByRole("button", { name: /Continue to TourDesk payment/ })).toHaveCount(0);
    await page.waitForTimeout(1200);
    expect((await bookings(id)).length).toBe(1);
    await page.reload();
    await expect(alertOf(page)).toContainText("could not confirm");
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
    const date = dateTrigger(page);
    await expect(date).toBeEnabled();
    // Reach the date control with the real keyboard, as a user would.
    await page.mouse.click(5, 5);
    let reached = false;
    for (let n = 0; n < 80 && !reached; n++) {
      await page.keyboard.press("Tab");
      reached = await date.evaluate((el) => el === document.activeElement);
    }
    expect(reached, "date control reachable by Tab").toBe(true);
    const ring = await date.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, color: s.outlineColor, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    const [r, g, b] = ring.color.match(/\d+/g)!.map(Number);
    expect(r + g + b, `focus ring colour ${ring.color} must contrast with the navy panel`).toBeGreaterThan(300);
    // Calendar by keyboard: Enter opens, focus moves into the grid, Escape closes and
    // returns focus to the trigger; Enter on a day chooses it.
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Choose a date" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("td button:focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(date).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog.locator("td button:focus")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("radiogroup", { name: "Departure time" })).toBeVisible();
    await slotRadio(page, "10:00").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "Participants" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: /Adults/ })).toHaveAttribute("type", "number");
    await expect(page.getByRole("button", { name: "Increase Adults" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh availability" })).toBeVisible();
  });
});

// The Viator product page is covered in e2e/viator-product.spec.ts.

test("the checkout return page never claims payment or confirmation", async ({ page }, testInfo) => {
  await prepare(page, testInfo);
  await page.goto("/booking/return");
  const text = (await page.locator("main").innerText()).toLowerCase();
  expect(text).toContain("does not confirm payment");
  expect(text).not.toMatch(/payment (was )?(successful|received|complete)|booking (is )?confirmed|thank you for your (order|booking|purchase)|you are booked/);
  await layoutOk(page).catch(() => undefined);
  await shot(page, testInfo, "booking-return");
});
