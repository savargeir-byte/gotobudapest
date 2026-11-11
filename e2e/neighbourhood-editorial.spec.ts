import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// Each neighbourhood page carries its extra editorial (lib/neighbourhood-editorial/data), keeps its Sanity text, shows one tour rail,
// links onward, and no two of the 35 pages share a hero photograph.
type Editorial = { slug: string; sections: { title: string; paragraphs: string[] }[]; placeSlugs?: string[]; sources: { url: string }[] };
const dir = path.join(__dirname, "..", "lib", "neighbourhood-editorial", "data");
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "photos-hoods.json");
const items: Editorial[] = files.map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Editorial);
const registry: Record<string, { alt: string; width: number; height: number; credit: { author: string; sourceUrl: string } }> = (() => {
  try {
    return JSON.parse(readFileSync(path.join(dir, "photos-hoods.json"), "utf8"));
  } catch {
    return {};
  }
})();

test.skip(items.length === 0, "no neighbourhood editorial shipped yet");

for (const e of items) {
  test(`neighbourhood editorial: ${e.slug}`, async ({ page, request }) => {
    const res = await page.goto(`/neighbourhoods/${e.slug}`);
    expect(res?.status()).toBe(200);
    for (const s of e.sections) await expect(page.getByRole("heading", { level: 2, name: s.title, exact: true })).toBeVisible();
    // The new text really is on the page (first sentence of the first paragraph).
    const first = e.sections[0].paragraphs[0].split(/(?<=\.)\s/)[0].slice(0, 60);
    await expect(page.locator("#topic")).toContainText(first);
    // One tour rail, never an empty column.
    await expect(page.getByTestId("contextual-tours").or(page.locator(".rail-link-card"))).toHaveCount(1);
    // Sources shown, onward links resolve.
    for (const src of e.sources.slice(0, 2)) await expect(page.locator(`.article-sources a[href="${src.url}"]`)).toHaveCount(1);
    const hrefs = await page.$$eval("main a[href^='/']", (as) => [...new Set(as.map((a) => a.getAttribute("href") || ""))]);
    for (const h of hrefs.filter((x) => /^\/(attractions|neighbourhoods|guides|experiences)\//.test(x)).slice(0, 10)) expect((await request.get(h)).status(), h).toBe(200);
    // Hero: landscape, with alt and (for overridden heroes) a credit.
    const hero = page.locator(".article-hero img").first();
    await expect(hero).toBeVisible();
    expect((await hero.getAttribute("alt"))!.length).toBeGreaterThan(15);
    const reg = registry[`hood-${e.slug}`];
    if (reg) {
      await expect(page.locator(".article-hero figcaption")).toContainText(reg.credit.author.slice(0, 15));
      expect(reg.width).toBeGreaterThan(reg.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}

test("no two neighbourhood pages share a hero photograph, and none is portrait", async ({ page, request }) => {
  test.setTimeout(180_000);
  const sm = await (await request.get("/sitemap.xml")).text();
  const slugs = [...sm.matchAll(/\/neighbourhoods\/([a-z0-9-]+)</g)].map((m) => m[1]);
  expect(slugs.length).toBeGreaterThanOrEqual(35);
  const seen = new Map<string, string>();
  for (const slug of slugs) {
    await page.goto(`/neighbourhoods/${slug}`);
    const img = page.locator(".article-hero img").first();
    const src = decodeURIComponent((await img.getAttribute("src"))!).replace(/.*[?&]url=/, "").replace(/&.*/, "");
    const key = src.replace(/-(640|1280)\.webp$/, "");
    expect(seen.get(key), `${slug} shares its hero with ${seen.get(key)}`).toBeUndefined();
    seen.set(key, slug);
    const size = await img.evaluate((i: HTMLImageElement) => ({ w: i.naturalWidth, h: i.naturalHeight }));
    if (size.w) expect(size.w, `${slug} hero is portrait`).toBeGreaterThanOrEqual(size.h);
  }
});
