import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { CONSENT_COOKIE, POLICY_VERSION } from "../lib/consent/consent";
import { isAnalyticsUrl, isGoogleAnalyticsUrl, isGoogleTagUrl, isVercelAnalyticsUrl, isVercelInsightsScript } from "./support/analytics-hosts";

// Cookie consent, tested from the browser on desktop and mobile. Every state starts from an EMPTY browser (the shared
// config pre-sets a "rejected" choice for the other specs). Third-party and analytics requests are intercepted and
// counted, so nothing leaves the machine; an empty stub stands in for the Vercel script.
test.use({ storageState: { cookies: [], origins: [] } });

async function watch(page: Page) {
  const analytics: string[] = [];
  await page.route(isVercelAnalyticsUrl, (route) => {
    analytics.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "/* test stub */" });
  });
  await page.route(isGoogleAnalyticsUrl, (route) => {
    analytics.push(route.request().url());
    return route.abort();
  });
  page.on("request", (r) => {
    if (isAnalyticsUrl(r.url()) && !analytics.includes(r.url())) analytics.push(r.url());
  });
  return analytics;
}

const consentCookie = async (context: BrowserContext) => (await context.cookies()).find((c) => c.name === CONSENT_COOKIE);
const decoded = (value: string | undefined) => (value ? decodeURIComponent(value) : "");
const banner = (page: Page) => page.getByTestId("consent-banner");
const dialog = (page: Page) => page.getByTestId("consent-dialog");

test.describe("first visit, no choice", () => {
  test("shows three equally prominent choices and sets nothing optional", async ({ page, context }) => {
    const analytics = await watch(page);
    const hosts = new Set<string>();
    page.on("request", (r) => hosts.add(new URL(r.url()).hostname));
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    const reject = banner(page).getByRole("button", { name: "Reject all" });
    const manage = banner(page).getByRole("button", { name: "Manage preferences" });
    const accept = banner(page).getByRole("button", { name: "Accept all" });
    for (const b of [reject, manage, accept]) await expect(b).toBeVisible();
    const [r, m, a] = await Promise.all([reject.boundingBox(), manage.boundingBox(), accept.boundingBox()]);
    expect(r!.height).toBeCloseTo(a!.height, 0);
    expect(r!.width).toBeCloseTo(a!.width, 0);
    expect(m!.height).toBeCloseTo(a!.height, 0);
    const style = (b: typeof reject) => b.evaluate((e) => { const s = getComputedStyle(e); return [s.backgroundColor, s.color, s.fontSize, s.fontWeight, s.borderColor].join("|"); });
    expect(await style(reject)).toBe(await style(accept));
    await page.waitForLoadState("networkidle");
    expect(await consentCookie(context), "no consent record before a choice").toBeUndefined();
    expect(await context.cookies(), "no cookies at all").toEqual([]);
    expect(await page.evaluate(() => [document.cookie, localStorage.length, sessionStorage.length])).toEqual(["", 0, 0]);
    expect(analytics, "no analytics request before consent").toEqual([]);
    expect([...hosts].filter((h) => /google|vercel|doubleclick|facebook/.test(h))).toEqual([]);
    expect(await page.evaluate(() => "dataLayer" in window || "gtag" in window)).toBe(false);
  });

  test("stays visible across pages until a choice is made, and does not cover the footer link", async ({ page }) => {
    await page.goto("/privacy");
    await expect(banner(page)).toBeVisible();
    await page.goto("/attractions");
    await expect(banner(page)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("choices", () => {
  test("Reject all: records the refusal, no analytics ever, and the question is not asked again", async ({ page, context }) => {
    const analytics = await watch(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Reject all" }).click();
    await expect(banner(page)).toHaveCount(0);
    const c = await consentCookie(context);
    expect(decoded(c?.value)).toMatch(new RegExp(`^p=${POLICY_VERSION}&a=0&f=0&m=0&t=\\d{4}-`));
    expect(c?.httpOnly).toBe(false);
    expect(c?.sameSite).toBe("Lax");
    expect(c!.expires - Date.now() / 1000).toBeGreaterThan(170 * 86400);
    expect(c!.expires - Date.now() / 1000).toBeLessThan(181 * 86400);
    await page.goto("/attractions/chain-bridge");
    await page.goto("/guides");
    await page.reload();
    await expect(banner(page)).toHaveCount(0);
    expect(analytics).toEqual([]);
    expect((await context.cookies()).map((x) => x.name)).toEqual([CONSENT_COOKIE]);
  });

  test("Accept all: records the choice and only then loads GA4 and Vercel Web Analytics", async ({ page, context }) => {
    const analytics = await watch(page);
    await page.goto("/");
    expect(analytics).toEqual([]);
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toHaveCount(0);
    expect(decoded((await consentCookie(context))?.value)).toMatch(/&a=1&f=1&m=1&/);
    await expect.poll(() => analytics.filter((u) => isVercelInsightsScript(u)).length).toBeGreaterThan(0);
    await expect.poll(() => analytics.filter((u) => isGoogleTagUrl(u)).length).toBeGreaterThan(0);
  });

  test("Manage preferences: every optional switch starts off, necessary is locked on, a partial choice is saved as chosen", async ({ page, context }) => {
    const analytics = await watch(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Manage preferences" }).click();
    await expect(dialog(page)).toBeVisible();
    const boxes = dialog(page).getByRole("checkbox");
    await expect(boxes).toHaveCount(4);
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(0)).toBeDisabled();
    for (const i of [1, 2, 3]) await expect(boxes.nth(i)).not.toBeChecked();
    await dialog(page).getByRole("checkbox", { name: "Analytics" }).check();
    await dialog(page).getByRole("button", { name: "Save my choices" }).click();
    await expect(dialog(page)).toBeHidden();
    expect(decoded((await consentCookie(context))?.value)).toMatch(/&a=1&f=0&m=0&/);
    await expect.poll(() => analytics.some((u) => isVercelAnalyticsUrl(u))).toBe(true);
  });

  test("Marketing only does not turn analytics on", async ({ page, context }) => {
    const analytics = await watch(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Manage preferences" }).click();
    await dialog(page).getByRole("checkbox", { name: "Marketing and advertising" }).check();
    await dialog(page).getByRole("button", { name: "Save my choices" }).click();
    expect(decoded((await consentCookie(context))?.value)).toMatch(/&a=0&f=0&m=1&/);
    await page.goto("/guides");
    expect(analytics).toEqual([]);
  });

  test("Escape closes the preferences without saving anything", async ({ page, context }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Manage preferences" }).click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    expect(await consentCookie(context)).toBeUndefined();
    await expect(banner(page)).toBeVisible();
  });
});

test.describe("changing and withdrawing", () => {
  test("footer 'Cookie settings' reopens the choices, shows the current state, and withdrawal removes Google cookies and stops analytics", async ({ page, context }) => {
    const analytics = await watch(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect.poll(() => analytics.length).toBeGreaterThan(0);
    // A Google Analytics cookie left over from an earlier visit must disappear on withdrawal.
    await context.addCookies([
      { name: "_ga", value: "GA1.1.123.456", url: page.url() },
      { name: "_ga_TEST123456", value: "GS1.1.1.1", url: page.url() },
    ]);
    await page.getByRole("button", { name: "Cookie settings" }).click();
    await expect(dialog(page)).toBeVisible();
    for (const i of [1, 2, 3]) await expect(dialog(page).getByRole("checkbox").nth(i)).toBeChecked();
    await dialog(page).getByRole("button", { name: "Reject all" }).click();
    await expect(dialog(page)).toBeHidden();
    expect(decoded((await consentCookie(context))?.value)).toMatch(/&a=0&f=0&m=0&/);
    await expect.poll(async () => (await context.cookies()).map((c) => c.name).sort()).toEqual([CONSENT_COOKIE]);
    const seen = analytics.length;
    await page.goto("/attractions");
    await page.goto("/guides");
    expect(analytics.length, "no new analytics request after withdrawal").toBe(seen);
    await expect(banner(page)).toHaveCount(0);
  });

  test("a change of mind is possible in both directions from the footer link on every kind of page", async ({ page, context }) => {
    await watch(page);
    for (const path of ["/", "/privacy", "/attractions", "/guides", "/tours"]) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: "Cookie settings" }).last(), path).toBeVisible();
    }
    await page.goto("/privacy");
    await banner(page).getByRole("button", { name: "Reject all" }).click();
    await page.getByRole("button", { name: "Cookie settings" }).last().click();
    await dialog(page).getByRole("checkbox", { name: "Analytics" }).check();
    await dialog(page).getByRole("button", { name: "Save my choices" }).click();
    expect(decoded((await consentCookie(context))?.value)).toMatch(/&a=1&f=0&m=0&/);
  });

  test("clearing cookies asks again; so does a record from another policy version or an expired one", async ({ page, context }) => {
    await watch(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Reject all" }).click();
    await context.clearCookies();
    await page.reload();
    await expect(banner(page)).toBeVisible();
    const t = new Date().toISOString();
    await context.addCookies([{ name: CONSENT_COOKIE, value: encodeURIComponent(`p=1999-01-01&a=1&f=1&m=1&t=${t}`), url: page.url() }]);
    await page.reload();
    await expect(banner(page), "old policy version is not accepted as consent").toBeVisible();
    const longAgo = new Date(Date.now() - 200 * 86_400_000).toISOString();
    await context.addCookies([{ name: CONSENT_COOKIE, value: encodeURIComponent(`p=${POLICY_VERSION}&a=1&f=1&m=1&t=${longAgo}`), url: page.url() }]);
    await page.reload();
    await expect(banner(page), "an expired record is not accepted").toBeVisible();
  });
});

test.describe("privacy page matches the behaviour", () => {
  test("lists the real cookie, its category and lifespan, the categories and the rights", async ({ page }) => {
    await watch(page);
    await page.goto("/privacy");
    const row = page.locator("tr", { hasText: CONSENT_COOKIE });
    await expect(row).toContainText("Strictly necessary");
    await expect(row).toContainText("180 days");
    await expect(page.locator("tr", { has: page.locator("code", { hasText: /^_ga$/ }) })).toContainText("Analytics (optional)");
    for (const heading of ["Who is responsible", "Your cookie choices", "Cookie inventory", "Analytics", "Retention and transfers", "Your rights", "Affiliate links"])
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/does not use analytics/i);
  });
});
