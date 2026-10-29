import { expect, request as pwRequest, test, type APIRequestContext, type Page } from "@playwright/test";
import type { MarketplaceResult } from "../lib/marketplace/types";

// TourDesk is PAUSED: the marketplace switch (lib/marketplace/enabled.ts) is off by default, with no
// configuration. These MOCKED tests run against a dedicated server (port 3103) that has TourDesk
// credentials configured but the switch NOT set, and prove that the public site neither shows nor
// calls TourDesk, while Viator and Tiqets keep working. The integration code and its own tests
// (e2e/tourdesk-discovery.spec.ts, server 3101 with the switch on) are untouched.
const BASE = "http://localhost:3103";
const API = `${BASE}/api/marketplace/search`;
const MOCK = "http://127.0.0.1:3900";

test.skip(!!process.env.PW_BASE_URL, "needs the local mock-provider server");
test.describe.configure({ mode: "serial" });
test.use({ baseURL: BASE });
test.beforeEach(({}, info) => test.skip(!info.project.name.startsWith("tourdesk-hidden"), "runs in its own projects"));

let ctx: APIRequestContext;
test.beforeAll(async () => {
  ctx = await pwRequest.newContext();
});
test.afterAll(async () => {
  await ctx.dispose();
});
test.beforeEach(async () => {
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true, clearLog: true } });
});

const tourdeskCalls = async () =>
  ((await (await ctx.get(`${MOCK}/__log/__list`)).json()) as { provider: string }[]).filter((e) => e.provider === "tourdesk");
const anyProviderCalls = async () => ((await (await ctx.get(`${MOCK}/__log/__list`)).json()) as { provider: string }[]).length;

const text = async (page: Page) => (await page.locator("body").innerText()).toLowerCase();

test("the search API names only Viator and Tiqets and never mentions TourDesk", async () => {
  const res = await ctx.get(API);
  expect(res.status()).toBe(200);
  const raw = await res.text();
  const body = JSON.parse(raw) as MarketplaceResult;
  expect(Object.keys(body.providers).sort()).toEqual(["tiqets", "viator"]);
  expect(body.providers.viator.status).toBe("ok");
  expect(body.providers.tiqets.status).toBe("ok");
  expect(raw.toLowerCase()).not.toContain("tourdesk");
  expect(body.items.length).toBeGreaterThan(10);
  expect(new Set(body.items.map((i) => i.provider))).toEqual(new Set(["viator", "tiqets"]));
  expect(await tourdeskCalls()).toEqual([]);
});

test("the TourDesk provider filter is not accepted by the API; the page ignores an old link to it", async ({ page }) => {
  const res = await ctx.get(`${API}?provider=tourdesk`);
  expect(res.status()).toBe(400);
  expect((await res.text()).toLowerCase()).not.toContain("unavailable");
  await page.goto("/tours?provider=tourdesk");
  await expect(page.locator(".mk-card").first()).toBeVisible();
  expect(new Set(await page.locator(".mk-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-provider"))))).toEqual(new Set(["viator", "tiqets"]));
  await expect(page.locator('.mk-empty[role="alert"], [data-provider-status]')).toHaveCount(0);
  expect(await text(page)).not.toContain("tourdesk");
  expect(await tourdeskCalls()).toEqual([]);
});

test("/tours: no TourDesk filter, text, banner or count; the provider filter lists Viator and Tiqets", async ({ page }, info) => {
  await page.goto("/tours");
  await expect(page.locator(".mk-card").first()).toBeVisible();
  // The mobile filter panel is a drawer: open it, then read the provider fieldset.
  if (info.project.name.includes("mobile")) await page.getByRole("button", { name: /Filters/ }).click();
  const labels = await page.locator("fieldset", { has: page.locator("legend", { hasText: "Provider" }) }).locator("label").allInnerTexts();
  expect(labels.map((l) => l.trim())).toEqual(["All providers", "Viator", "Tiqets"]);
  expect(await text(page)).not.toContain("tourdesk");
  expect((await page.content()).toLowerCase()).not.toContain("tourdesk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Budapest tours");
  await expect(page.locator(".eyebrow").first()).toHaveText("TWO PROVIDERS. ONE BUDAPEST.");
  expect(await tourdeskCalls()).toEqual([]);
});

test("selecting each remaining provider works and the result count names only providers in use", async ({ page }) => {
  for (const provider of ["viator", "tiqets"] as const) {
    await page.goto(`/tours?provider=${provider}`);
    await expect(page.locator(".mk-card").first()).toBeVisible();
    expect(new Set(await page.locator(".mk-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-provider"))))).toEqual(new Set([provider]));
    expect(await text(page)).not.toContain("tourdesk");
  }
  await page.goto("/tours");
  const count = page.locator(".mk-count");
  if (await count.count()) await expect(count).not.toContainText(/tourdesk/i);
  expect(await tourdeskCalls()).toEqual([]);
});

test("every card still opens an internal Viator or Tiqets product page with the exact hand-off at the end", async ({ page }) => {
  await page.goto("/tours");
  await expect(page.locator(".mk-card").first()).toBeVisible();
  const links = await page.locator(".mk-card").evaluateAll((els) =>
    els.map((el) => ({ provider: el.getAttribute("data-provider"), product: [...el.querySelectorAll("a:not(.mk-venue-credit a)")].map((a) => a.getAttribute("href")) })),
  );
  for (const l of links) {
    expect(l.product).toHaveLength(1);
    expect(l.product[0]).toMatch(new RegExp(`^/tours/${l.provider}/[A-Za-z0-9-]+$`));
  }
  // a Viator and a Tiqets product page, with the provider link present once and last
  for (const provider of ["viator", "tiqets"]) {
    const href = links.find((l) => l.provider === provider)!.product[0]!;
    await page.goto(href);
    const external = page.locator('a[href^="https://www.viator.com"], a[href^="https://www.tiqets.com"]');
    await expect(external).toHaveCount(1);
    await expect(external).toHaveAttribute("href", /\?.*(mcid|partner)=/);
  }
});

test("the home page row, the legacy offers API and the other public pages never call TourDesk", async ({ page }) => {
  await page.goto("/");
  const row = page.getByTestId("contextual-tours");
  await row.evaluate((el) => el.scrollIntoView());
  await expect(row.locator(".mk-card").first()).toBeVisible();
  expect(await text(page)).not.toContain("tourdesk");
  const offers = await ctx.get(`${BASE}/api/budapest-offers?kind=guide&slug=danube-cruises`);
  expect(offers.status()).toBe(200);
  expect((await offers.text()).toLowerCase()).not.toContain("tourdesk");
  for (const path of ["/privacy", "/guides/danube-cruises", "/attractions/chain-bridge"]) {
    await page.goto(path);
    expect(await text(page), path).not.toContain("tourdesk");
  }
  expect(await tourdeskCalls()).toEqual([]);
  expect(await anyProviderCalls()).toBeGreaterThan(0); // Viator and Tiqets were asked
});

test("an old TourDesk product link goes to the marketplace; its APIs answer without calling TourDesk; checkout stays off", async ({ page }) => {
  const response = await page.goto("/tours/tourdesk/12-2");
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/tours");
  await expect(page.locator(".mk-card").first()).toBeVisible();
  expect(await text(page)).not.toContain("tourdesk");
  const details = await ctx.get(`${BASE}/api/booking/tourdesk/12-2`);
  expect(details.status()).toBe(404);
  const checkout = await ctx.post(`${BASE}/api/booking/tourdesk/checkout`, { data: { id: "12-2" } });
  expect(checkout.status()).toBe(503); // native checkout has its own gate and is off
  expect(await tourdeskCalls()).toEqual([]);
});
