import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// Every attraction of the 90-place expansion (lib/new-attractions/data/batch-*.json) must render as a complete page, appear in the
// directory and the sitemap, and link onward. The data files are the source of truth, so this spec grows with every batch.
type Item = {
  slug: string; name: string; nameHu: string; category: string; district?: string; outsideBudapest?: boolean;
  neighbourhoods: string[]; sources: { url: string }[]; relatedPlaces: string[]; photoKey: string | null; photoStatus: string;
  coordinates: { latitude: number; longitude: number };
};
const dir = path.join(__dirname, "..", "lib", "new-attractions", "data");
const items: Item[] = readdirSync(dir)
  .filter((f) => /^batch-.*\.json$/.test(f))
  .flatMap((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Item[]);
const photoRegistry: Record<string, { alt: string; credit: { author: string; sourceUrl: string } }> = Object.assign(
  {},
  ...readdirSync(dir).filter((f) => /^photos-.*\.json$/.test(f)).map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"))),
);

test.skip(items.length === 0, "no new attractions shipped yet");

for (const a of items) {
  test(`new attraction page: ${a.slug}`, async ({ page, request }) => {
    const res = await page.goto(`/attractions/${a.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: a.name })).toBeVisible();
    if (a.nameHu !== a.name) await expect(page.locator(".place-name-hu")).toHaveText(a.nameHu);
    await expect(page.getByRole("heading", { name: `About ${a.name}` })).toBeVisible();
    await expect(page.getByRole("heading", { name: `History of ${a.name}` })).toBeVisible();
    await expect(page.locator("main")).toContainText("Facts checked against these sources");
    expect(await page.locator("main a[href^='https://']").count()).toBeGreaterThan(1);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(new RegExp(`/attractions/${a.slug}$`));
    expect((await page.locator('meta[name="description"]').getAttribute("content"))!.length).toBeGreaterThan(79);
    const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || "{}")));
    const place = ld.find((d) => d["@type"] === "TouristAttraction");
    expect(place?.name).toBe(a.name);
    expect(place?.geo?.latitude).toBeCloseTo(a.coordinates.latitude, 3);
    if (a.photoStatus === "ok" && a.photoKey) {
      const hero = page.locator("figure.article-hero img");
      await expect(hero).toBeVisible();
      expect(await hero.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      expect(await hero.getAttribute("alt")).toBe(photoRegistry[a.photoKey].alt);
      await expect(page.locator("figure.article-hero figcaption")).toContainText(photoRegistry[a.photoKey].credit.author.split(/[ ,]/)[0]);
    } else {
      await expect(page.locator("figure.article-hero img")).toHaveCount(0);
    }
    // a booking path exists: the single rail with its explore card; no other tour block
    await expect(page.locator("aside.attraction-booking-rail")).toHaveCount(1);
    expect(await page.getByTestId("contextual-tours").count()).toBeLessThanOrEqual(1);
    if (a.outsideBudapest) await expect(page.locator(".status-note")).toContainText("outside Budapest");
    // onward links resolve
    const hrefs = await page.$$eval("main a[href^='/']", (as) => [...new Set(as.map((x) => (x as HTMLAnchorElement).getAttribute("href") || ""))]);
    for (const h of hrefs.filter((x) => /^\/(attractions|neighbourhoods|guides|experiences)\//.test(x)).slice(0, 12))
      expect((await request.get(h.split("#")[0])).status(), h).toBe(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("the new attractions are in the sitemap and findable in the directory", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const a of items) expect(sitemap, a.slug).toContain(`/attractions/${a.slug}`);
  await page.goto("/attractions");
  const search = page.getByLabel(/^Search \d+ places$/);
  for (const a of items.filter((_, i) => i % 5 === 0)) {
    await search.fill(a.name);
    await expect(page.locator(`.cards a[href="/attractions/${a.slug}"]`).first(), a.slug).toBeVisible();
  }
});

test("neighbourhood pages list the new places that name them", async ({ page }) => {
  const byHood = new Map<string, Item[]>();
  for (const a of items) for (const n of a.neighbourhoods) byHood.set(n, [...(byHood.get(n) ?? []), a]);
  for (const [hood, list] of [...byHood].slice(0, 6)) {
    await page.goto(`/neighbourhoods/${hood}`);
    for (const a of list.slice(0, 3)) await expect(page.locator(`#places a[href="/attractions/${a.slug}"]`).first(), `${hood} -> ${a.slug}`).toHaveCount(1);
  }
});
