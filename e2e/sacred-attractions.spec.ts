import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The 16 churches and synagogues (PR #5, integrated through lib/attractions.json) behave like every other
// attraction: researched text, a cited history, a credited local photograph, directory, search and sitemap.
const sacred: { slug: string; name: string }[] = (
  JSON.parse(readFileSync("lib/attractions.json", "utf8")) as { slug: string; name: string; category: string }[]
).filter((a) => a.category === "Sacred architecture");

test("the catalogue has the 16 sacred sites", () => {
  expect(sacred).toHaveLength(16);
});

test("each sacred site page: one h1, About text, history with cited sources, credited hero and no overflow", async ({ page }) => {
  for (const { slug } of sacred) {
    const response = await page.goto(`/attractions/${slug}`, { waitUntil: "domcontentloaded" });
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: /^About / })).toBeVisible();
    await expect(page.locator(".attraction-history")).toBeVisible();
    const sources = page.locator(".attraction-history-sources a");
    expect(await sources.count(), `${slug} sources`).toBeGreaterThanOrEqual(2);
    for (const a of await sources.all()) await expect(a).toHaveAttribute("href", /^https:\/\//);
    const hero = page.locator(".article-hero img");
    await expect(hero).toHaveAttribute("alt", /.{20,}/);
    expect(await page.locator('.article-hero figcaption a[href^="https://commons.wikimedia.org/"]').count(), `${slug} credit link`).toBeGreaterThanOrEqual(1);
    // an honest religious-sites notice replaces the generic visit advice
    await expect(page.locator("main")).toContainText("active places of worship");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow ${slug}`).toBeLessThanOrEqual(1);
  }
});

test("St Elizabeth's bread and roses is labelled as a religious tradition", async ({ page }) => {
  await page.goto("/attractions/st-elizabeth-church-roses-square");
  await expect(page.locator(".attraction-story-kind").first()).toContainText("RELIGIOUS TRADITION");
});

test("the directory lists the sacred category and search finds a synagogue", async ({ page }) => {
  await page.goto("/attractions");
  await page.getByRole("button", { name: "Sacred architecture" }).click();
  await expect(page.getByRole("status")).toContainText("16 places");
  await expect(page.getByRole("link", { name: "Rumbach Street Synagogue" })).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByLabel(/^Search \d+ places$/).fill("Rumbach");
  await expect(page.locator(".cards article").first()).toContainText("Rumbach");
});

test("sacred sites are in the sitemap and on neighbourhood pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const { slug } of sacred.filter((s) => s.slug !== "")) expect(xml, slug).toContain(`/attractions/${slug}`);
  const html = await (await request.get("/neighbourhoods/downtown-pest")).text();
  for (const slug of ["rumbach-street-synagogue", "kazinczy-street-orthodox-synagogue", "st-elizabeth-church-roses-square"]) {
    expect(html, slug).toContain(`/attractions/${slug}`);
  }
});

test("galleries of the sacred sites carry credited images", async ({ page }) => {
  await page.goto("/attractions/rumbach-street-synagogue");
  await expect(page.locator("main")).toContainText("Rumbach");
  expect(await page.locator("figure img, .attraction-gallery img").count()).toBeGreaterThanOrEqual(2);
});
