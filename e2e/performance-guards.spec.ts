import { expect, test } from "@playwright/test";
import fs from "node:fs";

// Regression guards for the Phase 19 performance work (T-010). They check what a lab run measured, not a score:
// heavy assets stay small, fonts and the directory come from our own origin and the HTML, and the directory does not jump.
test("the logo and the favicon stay small (they load on every page)", async () => {
  expect(fs.statSync("public/assets/gotobudapest-logo.svg").size, "logo svg").toBeLessThan(150 * 1024);
  expect(fs.statSync("app/favicon.ico").size, "favicon.ico").toBeLessThan(30 * 1024);
});

test("shared artwork used on cards and detail pages comes in 640 and 1280 px renditions, not the 2000 px file", async () => {
  for (const name of ["budapest", "danube", "city"]) {
    expect(fs.statSync(`public/assets/${name}-640.webp`).size, `${name}-640`).toBeLessThan(90 * 1024);
    expect(fs.statSync(`public/assets/${name}-1280.webp`).size, `${name}-1280`).toBeLessThan(260 * 1024);
  }
});

test("pages load fonts from our own origin: no request to Google Fonts", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const host = new URL(r.url()).hostname;
    if (!["localhost", "127.0.0.1"].includes(host)) external.push(r.url());
  });
  for (const url of ["/", "/attractions", "/guides/getting-around-budapest"]) await page.goto(url, { waitUntil: "networkidle" });
  expect(external.filter((u) => {
    const host = new URL(u).hostname.toLowerCase();
    return host === "fonts.googleapis.com" || host === "fonts.gstatic.com";
  })).toEqual([]);
  const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
  expect(fonts.length, "web fonts loaded").toBeGreaterThan(0);
});

test.describe("the place directory is in the HTML", () => {
  test.use({ javaScriptEnabled: false });
  test("without JavaScript the first 24 places and their links are present", async ({ page }) => {
    await page.goto("/attractions");
    await expect(page.locator(".card")).toHaveCount(24);
    const links = await page.locator(".card h3 a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(links.every((h) => /^\/attractions\/[a-z0-9-]+$/.test(h ?? ""))).toBe(true);
    await expect(page.getByText("Loading the place directory")).toHaveCount(0);
  });
});

test("the directory does not shift while it loads", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/attractions", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.1);
});

test("a ?q= link still filters the directory after hydration", async ({ page }) => {
  await page.goto("/attractions?q=synagogue");
  await expect(page.getByLabel(/^Search \d+ places$/)).toHaveValue("synagogue");
  const count = await page.locator(".card").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(24);
});
