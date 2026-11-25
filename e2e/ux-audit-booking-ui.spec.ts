import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, type Page } from "@playwright/test";

// UX AUDIT HARNESS (not a regression test): captures full-page screenshots and layout metrics of representative pages at six
// widths on the MOCKED catalogue (port 3101, no live provider). It runs only when UX_AUDIT_DIR is set, so the normal suite skips it.
//   UX_AUDIT_DIR=<dir> npx playwright test e2e/ux-audit-booking-ui.spec.ts --project=booking-ui-desktop

const OUT = process.env.UX_AUDIT_DIR;
const METRICS_ONLY = process.env.UX_AUDIT_MODE === "metrics";
const WIDTHS = [360, 390, 430, 768, 1024, 1440];
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';

type Item = { detailUrl: string; provider: string };

async function settle(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(30);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function metrics(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const small: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("a[href], button, input, select, summary, [role=button]")) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || r.width === 0 || r.height === 0) continue;
      // WCAG 2.2 AA 2.5.8 asks for 24x24 CSS px (inline text links are exempt); 44 is the usual comfortable touch size.
      if ((r.height < 24 || r.width < 24) && !(el.tagName === "A" && cs.display === "inline")) small.push(`${el.tagName.toLowerCase()}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}:${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    const wide: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0) wide.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}`);
      if (wide.length > 5) break;
    }
    return {
      overflowPx: document.documentElement.scrollWidth - vw,
      overflowers: wide,
      h1: document.querySelectorAll("h1").length,
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      smallTargets: small.length,
      smallSample: small.slice(0, 6),
      pageHeight: document.documentElement.scrollHeight,
      bodyFont: getComputedStyle(document.body).fontSize,
    };
  });
}

test("capture", async ({ page, request }, info) => {
  test.skip(!OUT, "audit harness only");
  test.skip(info.project.name !== "booking-ui-desktop", "single project");
  test.setTimeout(2_400_000);
  mkdirSync(OUT!, { recursive: true });
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => (route.request().resourceType() === "image" ? route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg }) : route.abort()),
  );

  const find = async (provider: string) => {
    const res = await request.get(`/api/marketplace/search?provider=${provider}`);
    return ((await res.json()) as { items: Item[] }).items.find((i) => i.provider === provider)?.detailUrl;
  };
  const viator = await find("viator");
  const tiqets = await find("tiqets");
  const pages: [string, string][] = [
    ["home", "/"],
    ["tours", "/tours"],
    ["tours-cruises", "/tours?category=cruises"],
    ["tours-baths", "/tours?category=baths"],
    ["tours-empty", "/tours?q=zzzzqqq"],
    ["viator-product", viator || "/tours"],
    ["tiqets-product", tiqets || "/tours"],
    ["attractions", "/attractions"],
    ["attraction-parliament", "/attractions/hungarian-parliament"],
    ["attraction-szechenyi", "/attractions/szechenyi-thermal-bath"],
    ["neighbourhood", "/neighbourhoods/castle-district"],
    ["experience-danube", "/experiences/danube"],
    ["guide", "/guides/budapest-in-3-days"],
    ["about", "/about"],
    ["not-found", "/this-page-does-not-exist"],
  ];
  const rows: Record<string, unknown>[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: w >= 1024 ? 900 : 800 });
    for (const [name, url] of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForLoadState("load").catch(() => {});
      await page.locator("main").first().waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
      if (/tours/.test(url)) await page.locator(".mk-card, .mk-empty, [role=status]").first().waitFor({ timeout: 8000 }).catch(() => {});
      const full = w === 390 || w === 1440;
      if (full) await settle(page);
      else await page.waitForTimeout(400);
      const m = await metrics(page);
      rows.push({ width: w, page: name, url, ...m });
      if (!METRICS_ONLY) await page.screenshot({ path: path.join(OUT!, `${name}-${w}.png`), fullPage: full });
      writeFileSync(path.join(OUT!, "metrics.json"), JSON.stringify(rows, null, 1));
    }
  }
  // Cookie banner, first visit (no stored choice), mobile and desktop.
  for (const w of [390, 1440]) {
    const ctx = await page.context().browser()!.newContext({ viewport: { width: w, height: 800 }, baseURL: "http://localhost:3101" });
    const p = await ctx.newPage();
    await p.goto("/", { waitUntil: "load" });
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(OUT!, `consent-${w}.png`) });
    await ctx.close();
  }
  writeFileSync(path.join(OUT!, "metrics.json"), JSON.stringify(rows, null, 1));
});
