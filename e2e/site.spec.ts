import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const attractions: { slug: string }[] = JSON.parse(
  readFileSync("lib/attractions.json", "utf8"),
);
const guideSlugs = [
  "budapest-in-3-days",
  "budapest-thermal-baths",
  "getting-around-budapest",
  "buda-castle-district",
  "danube-cruises",
  "budapest-bars-nightlife",
];
const topicRoutes = [
  "/experiences/danube",
  "/experiences/thermal-baths",
  "/experiences/food-and-markets",
  "/neighbourhoods/castle-district",
  "/neighbourhoods/downtown-pest",
];
const staticRoutes = [
  "/",
  "/attractions",
  "/experiences",
  "/neighbourhoods",
  "/guides",
  "/essentials",
  "/privacy",
  ...topicRoutes,
  ...guideSlugs.map((s) => `/guides/${s}`),
];
const sampleAttractions = [
  "chain-bridge",
  "hungarian-parliament",
  "szechenyi-thermal-bath",
  "great-market-hall",
  "gellert-thermal-bath",
  "trinity-square",
].map((s) => `/attractions/${s}`);

async function loadAllImages(page: Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll("img[loading=lazy]")
      .forEach((i) => i.setAttribute("loading", "eager"));
  });
  await page.waitForFunction(
    () => [...document.images].every((i) => i.complete),
    undefined,
    { timeout: 20_000 },
  );
}

for (const route of [...staticRoutes, ...sampleAttractions]) {
  test(`renders cleanly: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route, { waitUntil: "load" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "GoToBudapest home" }).first(),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);
    await loadAllImages(page);
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((i) => !i.naturalWidth)
        .map((i) => i.currentSrc || i.src),
    );
    expect(broken, "broken images").toEqual([]);
    const noAlt = await page.evaluate(
      () =>
        [...document.images].filter((i) => i.getAttribute("alt") === null)
          .length,
    );
    expect(noAlt).toBe(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    expect(
      await page.locator('meta[name="description"]').getAttribute("content"),
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test("every internal link on the main pages resolves", async ({
  page,
  request,
}) => {
  const targets = new Set<string>();
  for (const route of [...staticRoutes, ...sampleAttractions]) {
    await page.goto(route);
    const hrefs = await page.$$eval("a[href]", (as) =>
      as.map((a) => a.getAttribute("href") || ""),
    );
    for (const h of hrefs)
      if (h.startsWith("/") && !h.startsWith("//"))
        targets.add(h.split("#")[0].split("?")[0] || "/");
  }
  const failures: string[] = [];
  for (const t of targets) {
    const r = await request.get(t);
    if (r.status() !== 200) failures.push(`${t} -> ${r.status()}`);
  }
  expect(failures).toEqual([]);
});

test("all 100 attraction pages exist", async ({ request }) => {
  const failures: string[] = [];
  for (const a of attractions) {
    const r = await request.get(`/attractions/${a.slug}`);
    if (r.status() !== 200) failures.push(`${a.slug} -> ${r.status()}`);
  }
  expect(failures).toEqual([]);
});

test("header navigation reaches every section", async ({ page, isMobile }) => {
  const targets: [string, string][] = [
    ["Attractions", "/attractions"],
    ["Experiences", "/experiences"],
    ["Neighbourhoods", "/neighbourhoods"],
    ["Travel guides", "/guides"],
  ];
  for (const [name, path] of targets) {
    await page.goto("/");
    if (isMobile)
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name })
      .click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("trip planner is gone", async ({ page, request }) => {
  expect((await request.get("/plan")).status()).toBe(404);
  await page.goto("/");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/my trip|plan my trip|save to my trip/i);
  await page.goto("/attractions");
  await expect(page.getByRole("button", { name: /save/i })).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("attraction search and filters work", async ({ page }) => {
  await page.goto("/attractions");
  await page.getByLabel("Search 116 places").fill("Gerbeaud");
  await expect(page.locator(".cards article").first()).toContainText(
    "Gerbeaud",
  );
  await page.getByLabel("Search 100 places").fill("");
  await page.getByRole("button", { name: "Baths & wellness" }).click();
  expect(await page.locator(".cards article").count()).toBeGreaterThan(5);
  await page.goto("/attractions?q=Danube");
  await expect(page.getByLabel("Search 100 places")).toHaveValue("Danube");
});

test("homepage search sends visitors to the directory", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search Budapest").fill("castle");
  await page.getByRole("button", { name: /Explore Budapest/ }).click();
  await expect(page).toHaveURL(/\/attractions\?q=castle/);
});

test("experience and neighbourhood pages list attractions and guides", async ({
  page,
}) => {
  for (const route of topicRoutes) {
    await page.goto(route);
    expect(await page.locator("#places .card").count()).toBeGreaterThanOrEqual(8);
    expect(await page.locator('a[href^="/guides/"]').count()).toBeGreaterThanOrEqual(2);
    const ld = await page.$$eval('script[type="application/ld+json"]', (s) =>
      s.map((x) => JSON.parse(x.textContent || "")),
    );
    expect(ld.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);
  }
});

test("unknown URLs return the branded 404", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("map");
  await expect(page.locator("header")).toBeVisible();
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const sm = await request.get("/sitemap.xml");
  expect(sm.status()).toBe(200);
  const xml = await sm.text();
  for (const p of [
    "/experiences/danube",
    "/neighbourhoods/castle-district",
    "/essentials",
    "/privacy",
    "/attractions/chain-bridge",
    "/guides/danube-cruises",
  ])
    expect(xml).toContain(p);
  expect((xml.match(/<loc>/g) || []).length).toBeGreaterThanOrEqual(118);
});
