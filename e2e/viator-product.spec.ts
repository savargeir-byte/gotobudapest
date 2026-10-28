// Browser-level tests of the internal Viator product page, desktop (1440x900) and mobile
// (Pixel 7). ALL MOCKED: the site is served by the dedicated `next start` on port 3101 whose
// Viator Partner API calls go to e2e/support/mock-provider.mjs on 127.0.0.1
// (BOOKING_MOCK_ORIGIN). Every other external request made by the browser is intercepted, so no
// live provider is contacted. These tests prove page structure and behaviour against synthetic
// responses; they are NOT a verification of live Viator availability, prices or data.
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MOCK = `http://127.0.0.1:${process.env.MOCK_PROVIDER_PORT || 3900}`;
const vCode = (prefix: string) => prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
const euro = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
const productUrl = (code: string) =>
  `https://www.viator.com/tours/Budapest/Mock-Danube-Cruise/d684-${code}?pid=P00MOCK&mcid=42383&medium=api&medium_version=2.0&uid=U-MOCK`;

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

async function logOf(id: string): Promise<{ method: string; path: string; body?: unknown }[]> {
  return (await fetch(`${MOCK}/__log/${id}`)).json();
}

type Env = { external: string[]; documents: string[]; problems: string[] };
async function prepare(page: Page): Promise<Env> {
  const env: Env = { external: [], documents: [], problems: [] };
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      const host = new URL(req.url()).hostname;
      env.external.push(`${req.resourceType()} ${host}`);
      if (req.resourceType() === "document") env.documents.push(host);
      if (req.resourceType() === "image") return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg });
      return route.abort();
    },
  );
  page.on("pageerror", (e) => env.problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) env.problems.push(`csp: ${m.text().slice(0, 200)}`);
  });
  return env;
}
async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: `test-results/viator-shots/${name}-${testInfo.project.name}.png`, fullPage: true });
}
async function layoutOk(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "horizontal overflow").toBeLessThanOrEqual(1);
  const overlap = await page.evaluate(() => {
    const a = document.querySelector(".vp-details")?.getBoundingClientRect();
    const b = document.querySelector("#availability")?.getBoundingClientRect();
    if (!a || !b) return false;
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  });
  expect(overlap, "details and availability overlap").toBe(false);
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src));
  expect(broken, "broken images").toEqual([]);
}
async function pickDate(page: Page) {
  await page.locator(".booking-date-trigger").click();
  const dialog = page.getByRole("dialog", { name: "Choose a date" });
  await expect(dialog).toBeVisible();
  await dialog.locator("td button:not(:disabled)").first().click();
  await expect(dialog).toBeHidden();
}
const providerLinks = (page: Page) => page.locator('a[href*="viator.com"]');

test.describe("Viator product page (MOCKED provider)", () => {
  test("marketplace card opens the internal page; details and availability come before the single Viator handoff", async ({ page }, testInfo) => {
    const env = await prepare(page);
    await page.goto("/tours?provider=viator");
    const card = page.locator('.mk-card[data-provider="viator"]').first();
    await expect(card).toBeVisible();
    const code = (await card.getAttribute("data-product"))!.split(":")[1];
    await card.getByRole("link", { name: /View details/ }).click();
    await expect(page).toHaveURL(new RegExp(`/tours/viator/${code}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Budapest Danube Cruise (mock)");

    // The page offers exactly ONE link to viator.com: the final handoff, after all details.
    await expect(providerLinks(page)).toHaveCount(1);
    const order = await page.evaluate(() => {
      const after = (a: Element | null, b: Element | null) =>
        !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      const q = (s: string) => document.querySelector(s);
      const cta = document.querySelector('a[href*="viator.com"]');
      const ids = ["vp-about", "vp-highlights", "vp-itinerary", "vp-meeting", "vp-included", "vp-info", "vp-cancel"];
      return {
        detailsBeforeAvailability: ids.every((i) => after(q("#" + i), q("#availability-heading"))),
        availabilityBeforeCta: after(q("#availability-heading"), cta),
        ctaInsideHandoff: !!cta?.closest("#book-on-viator"),
        ctaIsLastLinkInMain: (() => {
          const links = [...document.querySelectorAll("main a[href]")].filter((a) => !a.closest(".vp-sticky"));
          return links[links.length - 1] === cta;
        })(),
      };
    });
    expect(order).toEqual({
      detailsBeforeAvailability: true,
      availabilityBeforeCta: true,
      ctaInsideHandoff: true,
      ctaIsLastLinkInMain: true,
    });
    await layoutOk(page);
    await shot(page, testInfo, "viator-product");
    // Navigating to the page contacted no third-party document (the provider is only linked).
    expect(env.documents.filter((d) => /viator|tiqets/.test(d))).toEqual([]);
    expect(env.problems).toEqual([]);
  });

  test("shows the API product information and nothing else", async ({ page }) => {
    await prepare(page);
    const code = vCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    const main = page.locator("main");
    await expect(page.getByRole("heading", { level: 2, name: "About this experience" })).toBeVisible();
    // Description paragraphs: markup is removed, the second paragraph is kept.
    await expect(main).toContainText("Second paragraph about the Danube evening cruise.");
    expect(await main.innerHTML()).not.toContain("&lt;b&gt;");
    await expect(page.getByRole("heading", { name: "Highlights" })).toBeVisible();
    await expect(main).toContainText("Sail past the Parliament at night");
    // Rating and review count, duration, free cancellation, from price.
    await expect(page.locator(".vp-rating")).toContainText("4.6");
    await expect(page.locator(".vp-rating")).toContainText("1,234 reviews");
    await expect(page.locator(".vp-summary")).toContainText("2 h 30 min");
    await expect(page.locator(".vp-summary .vp-chip")).toHaveText("Free cancellation");
    await expect(page.locator(".vp-summary")).toContainText(euro(38.5));
    await expect(page.locator(".vp-facts")).toContainText("EN (audio), HU (audio)");
    await expect(page.locator(".vp-facts")).toContainText("Instant confirmation");
    // Itinerary, meeting and end point, inclusions / exclusions, options, good to know.
    await expect(page.getByRole("heading", { name: "Itinerary" })).toBeVisible();
    await expect(main).toContainText("Cruise past the Chain Bridge");
    await expect(main).toContainText("Admission included");
    await expect(main).toContainText("Meet at the Vigado pier");
    await expect(main).toContainText("Returns to the starting point");
    await expect(page.locator(".vp-yes")).toContainText("Welcome drink");
    await expect(page.locator(".vp-no")).toContainText("Hotel pickup");
    await expect(page.locator(".vp-options")).toContainText("Premium cruise");
    await expect(page.locator(".vp-info")).toContainText("Wheelchair accessible (mock)");
    await expect(page.getByRole("heading", { name: "Cancellation policy" })).toBeVisible();
    await expect(main).toContainText("100% refund when cancelled 1+ days before");
    await expect(main).toContainText("An adult must be part of the booking");
    // Gallery: cover first (photo 2 is the cover), thumbnails switch the large image.
    const big = page.locator(".vp-gallery-main img");
    await expect(big).toHaveAttribute("alt", "Mock photo 2");
    await expect(big).toHaveAttribute("referrerpolicy", "no-referrer");
    await expect(page.locator(".vp-thumbs button")).toHaveCount(3);
    await page.getByRole("button", { name: "Show photo 3 of 3" }).click();
    await expect(big).toHaveAttribute("alt", "Mock photo 3");
    // JSON-LD only carries real fields.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const ld = blocks.map((b) => JSON.parse(b)).find((b) => b["@type"] === "Product");
    expect(ld).toBeTruthy();
    expect(ld.name).toBe("Budapest Danube Cruise (mock)");
    expect(ld.offers).toMatchObject({ lowPrice: 38.5, priceCurrency: "EUR" });
    expect(ld.aggregateRating).toMatchObject({ ratingValue: 4.6, reviewCount: 1234 });
  });

  test("absent sections are absent: a product with no photos, highlights or itinerary shows none of them", async ({ page }) => {
    await prepare(page);
    await page.goto(`/tours/viator/${vCode("VNOIMG")}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".vp-gallery")).toHaveCount(0);
    for (const name of ["Highlights", "Itinerary", "Meeting and end point", "Good to know", "Options"]) {
      await expect(page.getByRole("heading", { name })).toHaveCount(0);
    }
    await expect(page.locator(".vp-rating")).toHaveCount(0);
    await expect(page.locator(".vp-summary .vp-chip")).toHaveCount(0);
    // What the API did return is still there.
    await expect(page.getByRole("heading", { name: "About this experience" })).toBeVisible();
    await expect(page.locator(".vp-yes")).toContainText("Welcome drink");
    await expect(providerLinks(page)).toHaveCount(1);
  });

  test("the handoff is the exact API productUrl, opens a new tab, is sponsored and says choices are repeated on Viator", async ({ page }) => {
    await prepare(page);
    const code = vCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    const cta = page.getByRole("link", { name: /Continue to Viator/ });
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("href", productUrl(code)); // byte for byte, tracking parameters included
    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", "sponsored noopener noreferrer");
    await expect(page.locator("#book-on-viator")).toContainText("not carried over");
    await expect(page.locator("#book-on-viator")).toContainText("choose them again on Viator");

    // Choosing a date and group never changes the URL (nothing is appended).
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.locator(".vp-results")).toBeVisible();
    await expect(cta).toHaveAttribute("href", productUrl(code));
  });

  test("live availability: date, travellers, options with real totals; only the three allowed endpoints are used", async ({ page }, testInfo) => {
    const env = await prepare(page);
    const code = vCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    await expect(page.getByText("From").first()).toBeVisible();
    await pickDate(page);
    await expect(page.getByRole("group", { name: /Travellers/ })).toBeVisible();
    await page.getByRole("button", { name: /Increase Adult/ }).click();
    await expect(page.getByRole("spinbutton", { name: /Adult/ })).toHaveValue("2");
    await page.getByRole("button", { name: "Check availability" }).click();

    const results = page.locator(".vp-results");
    await expect(results).toContainText("2 travellers");
    const seated = results.locator("li", { hasText: "Seated cruise" });
    await expect(seated).toContainText("Starts 19:00");
    await expect(seated).toContainText(euro(60)); // the special price wins
    await expect(seated).toContainText("2 × Adult (age 13–99): " + euro(60));
    await expect(results.locator("li", { hasText: "Premium cruise" })).toContainText(euro(100));
    await expect(results).toContainText("1 other option is not bookable on this date");
    await shot(page, testInfo, "viator-availability");
    await layoutOk(page);

    // Changing the group drops the stale answer instead of showing old prices.
    await page.getByRole("button", { name: /Increase Adult/ }).click();
    await expect(results).toHaveCount(0);

    const calls = await logOf(code);
    const check = calls.filter((c) => c.path === "availability/check");
    expect(check.length).toBe(1);
    expect(check[0].body).toMatchObject({
      productCode: code,
      currency: "EUR",
      paxMix: [{ ageBand: "ADULT", numberOfTravelers: 2 }],
    });
    expect(calls.filter((c) => c.path === `availability/schedules/${code}`).length).toBe(1);
    expect(calls.every((c) => c.path === `products/${code}` || c.path === `availability/schedules/${code}` || c.path === "availability/check")).toBe(true);
    expect(await (await fetch(`${MOCK}/__transactional`)).json()).toEqual([]);
    expect(env.problems).toEqual([]);
  });

  test("nothing bookable is stated plainly; a failed check is an error with retry, never 'sold out'", async ({ page }, testInfo) => {
    await prepare(page);
    await page.goto(`/tours/viator/${vCode("VNONE")}`);
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.locator(".vp-results")).toContainText("Nothing is bookable for this date: sold out.");

    const err = vCode("VERR");
    await page.goto(`/tours/viator/${err}`);
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    const alert = page.locator(".vp-panel [role=alert]").filter({ hasText: /try again|unavailable/i });
    await expect(alert.first()).toBeVisible();
    await expect(page.locator(".vp-results")).toHaveCount(0);
    await expect(page.getByText(/sold out|Nothing is bookable/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    // Everything that loaded is still there and the handoff is still offered.
    await expect(page.getByRole("heading", { name: "About this experience" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue to Viator/ })).toHaveAttribute("href", productUrl(err));
    await shot(page, testInfo, "viator-check-error");

    // A transient failure recovers with one click.
    const flaky = vCode("VCHKFLAKY");
    await page.goto(`/tours/viator/${flaky}`);
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator(".vp-results")).toContainText("Seated cruise");
  });

  for (const [prefix, label] of [
    ["VSCH403", "schedules forbidden (403)"],
    ["VSCH404", "schedules not found (404)"],
    ["VSCHEMPTY", "schedules empty"],
  ] as const) {
    test(`live availability unavailable (${label}): clear message, no fake controls, handoff still offered`, async ({ page }, testInfo) => {
      await prepare(page);
      const code = vCode(prefix);
      await page.goto(`/tours/viator/${code}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("#availability")).toContainText("Live availability is not available for this product here");
      await expect(page.locator(".booking-date-trigger")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Check availability" })).toHaveCount(0);
      await expect(page.getByText(/sold out/i)).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Continue to Viator/ })).toHaveAttribute("href", productUrl(code));
      await expect(page.getByRole("heading", { name: "About this experience" })).toBeVisible();
      await shot(page, testInfo, `viator-${prefix.toLowerCase()}`);
    });
  }

  test("a failing schedules call keeps the page and offers an inline retry that recovers", async ({ page }, testInfo) => {
    await prepare(page);
    const hard = vCode("VSCH500");
    await page.goto(`/tours/viator/${hard}`);
    await expect(page.getByRole("heading", { name: "About this experience" })).toBeVisible();
    await expect(page.locator("#availability [role=alert]")).toContainText("could not be loaded");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator("#availability [role=alert]")).toContainText("could not be loaded"); // still failing
    await expect(page.getByRole("link", { name: /Continue to Viator/ })).toHaveAttribute("href", productUrl(hard));
    await shot(page, testInfo, "viator-schedules-error");

    const flaky = vCode("VSCHFLAKY");
    await page.goto(`/tours/viator/${flaky}`);
    await expect(page.locator("#availability [role=alert]")).toContainText("could not be loaded");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator(".booking-date-trigger")).toBeVisible();
    await expect(page.locator("#availability [role=alert]")).toHaveCount(0);
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.locator(".vp-results")).toContainText("Seated cruise");
  });

  test("responsive layout: no overflow; the mobile sticky bar is an internal anchor, never a provider link", async ({ page }, testInfo) => {
    await prepare(page);
    await page.goto(`/tours/viator/${vCode("VOK")}`);
    await layoutOk(page);
    const sticky = page.locator(".vp-sticky");
    const mobile = (page.viewportSize()?.width ?? 1440) <= 900;
    if (mobile) {
      await expect(sticky).toBeVisible();
      const link = sticky.getByRole("link", { name: "Check availability" });
      await expect(link).toHaveAttribute("href", "#availability");
      await link.click();
      await expect
        .poll(() => page.evaluate(() => { const r = document.querySelector("#availability")!.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; }))
        .toBe(true);
    } else {
      await expect(sticky).toBeHidden();
      const [a, b] = await page.evaluate(() => [
        document.querySelector(".vp-details")!.getBoundingClientRect().right,
        document.querySelector("#availability")!.getBoundingClientRect().left,
      ]);
      expect(b).toBeGreaterThan(a); // side by side
    }
    // Every viator.com link is still the single final handoff.
    await expect(providerLinks(page)).toHaveCount(1);
    await expect(sticky.locator("a[href*='viator.com']")).toHaveCount(0);
    await shot(page, testInfo, "viator-responsive");
  });

  test("foreign destinations are refused", async ({ page }) => {
    await prepare(page);
    const res = await page.goto(`/tours/viator/${vCode("VFOR")}`);
    expect(res?.status()).toBe(404);
  });

  test("the product page never calls booking, hold, reserve, cart or target-lander endpoints", async ({ page }) => {
    await prepare(page);
    const code = vCode("VOK");
    await page.goto(`/tours/viator/${code}`);
    await pickDate(page);
    await page.getByRole("button", { name: "Check availability" }).click();
    await expect(page.locator(".vp-results")).toBeVisible();
    const calls = await logOf(code);
    expect(calls.map((c) => c.path).filter((p) => /(bookings?|reserve|hold|cart|target-lander|payment)/i.test(p))).toEqual([]);
    expect(await (await fetch(`${MOCK}/__transactional`)).json()).toEqual([]);
  });
});
