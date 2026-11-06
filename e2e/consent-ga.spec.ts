import { expect, test, type Page } from "@playwright/test";
import { CONSENT_COOKIE, POLICY_VERSION } from "../lib/consent/consent";
import { isAnalyticsUrl, isGoogleCollectUrl, isGoogleTagUrl, isVercelAnalyticsUrl } from "./support/analytics-hosts";

// GA4 event tracking in a browser, against the mocked providers (the booking-ui projects). The measurement ID is read at
// build time: a plain build uses the production stream G-GCVBYQPJ9W, NEXT_PUBLIC_GA_MEASUREMENT_ID overrides it:
//
//   npm run build   (production ID)   then   PW_EXPECT_GA=1 npx playwright test e2e/consent-ga.spec.ts
//
// Google is never contacted: its tag URL is answered with an empty stub, so what is checked is exactly what the page
// pushed to window.dataLayer (the commands Google's tag would have read). Without PW_EXPECT_GA these tests are skipped.
test.skip(!process.env.PW_EXPECT_GA, "set PW_EXPECT_GA=1 to run the GA4 data-layer checks against a built site");

// The build under test decides the ID: the production fallback unless NEXT_PUBLIC_GA_MEASUREMENT_ID overrides it.
const ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-GCVBYQPJ9W";
const GRANTED = `p=${POLICY_VERSION}&a=1&f=0&m=0&t=${new Date().toISOString()}`;
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

type Entry = unknown[];
async function prepare(page: Page, { consent }: { consent: "none" | "analytics" }) {
  const google: string[] = [];
  const external: string[] = [];
  await page.route((url) => isGoogleTagUrl(url), (route) => {
    google.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "/* test stub */" });
  });
  await page.route((url) => isGoogleCollectUrl(url) || isVercelAnalyticsUrl(url), (route) => {
    google.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname) && !isAnalyticsUrl(url),
    (route) => {
      const req = route.request();
      external.push(`${req.resourceType()} ${new URL(req.url()).hostname}`);
      if (req.resourceType() === "image") return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg });
      return route.abort();
    },
  );
  if (consent === "analytics")
    await page.context().addCookies([{ name: CONSENT_COOKIE, value: encodeURIComponent(GRANTED), url: test.info().project.use.baseURL ?? "http://localhost:3101" }]);
  return { google, external };
}
const layer = (page: Page) =>
  page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).map((a) => Array.from(a)));
const eventsOf = async (page: Page, name?: string) =>
  ((await layer(page)) as Entry[]).filter((e) => e[0] === "event" && (!name || e[1] === name)).map((e) => ({ name: e[1] as string, ...(e[2] as Record<string, string | boolean>) }) as { name: string; [k: string]: string | boolean });

test.use({ storageState: { cookies: [], origins: [] } });

test("before consent: no request to Google and no data layer; Reject keeps it that way", async ({ page }) => {
  const { google } = await prepare(page, { consent: "none" });
  await page.goto("/attractions/chain-bridge");
  await expect(page.getByTestId("consent-banner")).toBeVisible();
  expect(google).toEqual([]);
  expect(await page.evaluate(() => "dataLayer" in window)).toBe(false);
  await page.getByRole("button", { name: "Reject all" }).click();
  await page.goto("/guides");
  expect(google).toEqual([]);
  expect(await page.evaluate(() => "dataLayer" in window)).toBe(false);
});

test("Accept all: consent defaults denied, then granted; one page_view and one typed view per navigation, nothing duplicated", async ({ page }) => {
  const { google } = await prepare(page, { consent: "none" });
  await page.goto("/attractions/chain-bridge");
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect.poll(() => google.filter((u) => isGoogleTagUrl(u)).length).toBe(1);
  expect(google.find((u) => isGoogleTagUrl(u))).toContain(`id=${ID}`);
  const log = (await layer(page)) as Entry[];
  const order = log.filter((e) => e[0] === "consent" || e[0] === "config").map((e) => `${e[0]}:${e[1]}`);
  expect(order.slice(0, 3)).toEqual(["consent:default", "consent:update", `config:${ID}`]);
  expect((log.find((e) => e[0] === "consent" && e[1] === "default")![2] as Record<string, string>).analytics_storage).toBe("denied");
  expect((log.find((e) => e[0] === "consent" && e[1] === "update")![2] as Record<string, string>).analytics_storage).toBe("granted");
  expect((log.find((e) => e[0] === "config")![2] as Record<string, unknown>).send_page_view).toBe(false);
  await expect.poll(async () => (await eventsOf(page, "attraction_view")).length).toBe(1);
  expect(await eventsOf(page, "page_view")).toEqual([{ name: "page_view", page_path: "/attractions/chain-bridge", content_category: "attraction" }]);
  expect(await eventsOf(page, "attraction_view")).toEqual([{ name: "attraction_view", attraction_slug: "chain-bridge", page_path: "/attractions/chain-bridge" }]);
  const consent = await eventsOf(page, "cookie_consent_update");
  expect(consent).toEqual([{ name: "cookie_consent_update", consent_action: "accept_all", analytics: "granted", functional: "granted", marketing: "granted" }]);

  // Client-side navigation to a guide and an experience: one new page_view and one typed view each.
  await page.evaluate(() => (document.querySelector('a[href="/guides"]') as HTMLAnchorElement | null)?.click());
  await page.goto("/guides/danube-cruises");
  await expect.poll(async () => (await eventsOf(page, "guide_view")).length).toBe(1);
  expect((await eventsOf(page, "page_view")).map((e) => String(e.page_path))).toContain("/guides/danube-cruises");
  const views = (await eventsOf(page, "page_view")).map((e) => String(e.page_path));
  expect(new Set(views).size, "no page view is recorded twice").toBe(views.length);
});

test("consent already given: first page counted once; withdrawing stops events and removes the Google cookies", async ({ page, context }) => {
  const { google } = await prepare(page, { consent: "analytics" });
  await page.goto("/experiences/thermal-baths");
  await expect.poll(async () => (await eventsOf(page, "experience_view")).length).toBe(1);
  expect(await eventsOf(page, "cookie_consent_update"), "a consent read from an earlier visit is not re-reported").toEqual([]);
  expect(google.filter((u) => isGoogleTagUrl(u))).toHaveLength(1);
  // Google sets its cookies with Path=/ on the host, so the test plants them exactly like that.
  await context.addCookies([
    { name: "_ga", value: "GA1.1.1.1", domain: "localhost", path: "/" },
    { name: "_ga_TEST123456", value: "GS1.1.1", domain: "localhost", path: "/" },
  ]);
  const before = (await layer(page)).length;
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await page.getByTestId("consent-dialog").getByRole("button", { name: "Reject all" }).click();
  await expect.poll(async () => (await context.cookies()).map((c) => c.name).sort()).toEqual([CONSENT_COOKIE]);
  const after = ((await layer(page)) as Entry[]).slice(before);
  expect(after.some((e) => e[0] === "event")).toBe(false);
  expect(after.find((e) => e[0] === "consent")?.[1]).toBe("update");
  await page.goto("/attractions/chain-bridge");
  expect(await page.evaluate((id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`], ID)).toBeUndefined();
});

test("search events carry no search words; marketplace events carry provider, category and sort only", async ({ page }) => {
  await prepare(page, { consent: "analytics" });
  await page.goto("/");
  await page.locator("#search").fill("jane.doe@example.com");
  await page.getByRole("button", { name: /Explore Budapest/ }).click();
  await expect.poll(async () => (await eventsOf(page, "site_search")).length).toBe(1);
  expect((await eventsOf(page, "site_search"))[0]).toEqual({ name: "site_search", search_scope: "home", has_query: true });
  await page.goto("/tours?provider=tiqets");
  await page.getByRole("searchbox").fill("secret words");
  await page.getByRole("searchbox").press("Enter");
  await expect.poll(async () => (await eventsOf(page, "marketplace_search")).length).toBeGreaterThan(0);
  const all = JSON.stringify(await layer(page));
  expect(all).not.toMatch(/jane|example\.com|secret/);
  for (const e of await eventsOf(page, "marketplace_search")) expect(Object.keys(e).sort()).toEqual(["has_query", "name", "provider", "search_category", "sort"]);
});

test("tour card click, detail view, availability check and provider hand-off are recorded once each and never as a booking", async ({ page }) => {
  const { external } = await prepare(page, { consent: "analytics" });
  await page.goto("/tours?provider=tiqets");
  const card = page.locator(".mk-card").first();
  const product = (await card.getAttribute("data-product"))!;
  await card.getByRole("link", { name: /View details/ }).click();
  await expect(page).toHaveURL(/\/tours\/tiqets\/\d+$/);
  await expect.poll(async () => (await eventsOf(page, "tour_detail_view")).length).toBe(1);
  expect(await eventsOf(page, "tour_card_click")).toEqual([{ name: "tour_card_click", provider: "tiqets", product_id: product, placement: "marketplace_grid" }]);
  expect(await eventsOf(page, "tour_detail_view")).toEqual([
    { name: "tour_detail_view", provider: "tiqets", product_id: product, page_path: new URL(page.url()).pathname },
  ]);

  // Tiqets hand-off: a click on the sponsored link, recorded as hand-off + affiliate click (and only that).
  const cta = page.getByRole("link", { name: /Continue to Tiqets/ });
  await expect(cta).toBeVisible();
  await cta.click({ noWaitAfter: true });
  await expect.poll(async () => (await eventsOf(page, "provider_handoff")).length).toBe(1);
  expect(await eventsOf(page, "affiliate_link_click")).toHaveLength(1);
  expect(await eventsOf(page, "provider_handoff")).toEqual([{ name: "provider_handoff", provider: "tiqets", product_id: product, placement: "product_page" }]);
  const names = ((await layer(page)) as Entry[]).filter((e) => e[0] === "event").map((e) => e[1] as string);
  expect(names.filter((n) => /purchase|booking|conversion|order/i.test(n))).toEqual([]);
  expect(external.filter((e) => e.startsWith("document ")).length).toBeLessThanOrEqual(1);

  // Viator: the product page links straight to the exact tour on Viator (no availability form on this site any more),
  // so the click is a hand-off + affiliate click, and still never a booking.
  await page.goto("/tours/viator/VOKGAEVT");
  const viatorCta = page.getByRole("link", { name: /Book on Viator/ });
  await expect(viatorCta).toBeVisible();
  await viatorCta.click({ noWaitAfter: true });
  await expect.poll(async () => (await eventsOf(page, "provider_handoff")).length).toBe(1);
  expect(await eventsOf(page, "provider_handoff")).toEqual([{ name: "provider_handoff", provider: "viator", product_id: "viator:VOKGAEVT", placement: "product_page" }]);
  expect(await eventsOf(page, "availability_check")).toHaveLength(0);
});
