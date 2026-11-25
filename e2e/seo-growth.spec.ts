import { expect, test, type APIRequestContext } from "@playwright/test";

// Technical SEO and answer-engine checks over the real, built site: metadata length and uniqueness, canonical and robots
// signals, the crawlable attraction index, the quick-answer blocks with matching FAQ markup, and the About page.

const HOST = "https://www.gotobuda.com";
// Decode the few HTML entities React emits in text and attribute values in ONE pass, so that an escaped entity such as
// "&amp;quot;" decodes to the literal text "&quot;" and is never decoded a second time.
const ENTITIES: Record<string, string> = { "&amp;": "&", "&#x27;": "'", "&#39;": "'", "&quot;": '"' };
const dec = (s: string) => s.replace(/&amp;|&#x27;|&#39;|&quot;/g, (entity) => ENTITIES[entity]);

async function sitemapPaths(request: APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/");
}

test("home: a keyword title, a description under 160 characters and Organization data", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title).toMatch(/Budapest Travel Guide/);
  expect(title.length).toBeLessThanOrEqual(60);
  const desc = (await page.locator('meta[name="description"]').getAttribute("content"))!;
  expect(desc.length).toBeLessThanOrEqual(160);
  expect(desc).not.toMatch(/\b1\d\d places\b/);
  const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ""));
  expect(ld.join(" ")).toContain('"Organization"');
});

test("every sitemap page: one h1, a canonical on the real host, no noindex, a description of 160 characters or fewer, unique titles", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop", "a single pass over the HTML is enough");
  test.setTimeout(240_000);
  const paths = await sitemapPaths(request);
  expect(paths.length).toBeGreaterThan(290);
  const configured = !/<meta name="robots" content="[^"]*noindex/i.test(await (await request.get("/about")).text());
  const titles = new Map<string, string>();
  const problems: string[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (i < paths.length) {
        const p = paths[i++];
        const res = await request.get(p);
        if (res.status() !== 200) {
          problems.push(`${p}: HTTP ${res.status()}`);
          continue;
        }
        const html = await res.text();
        const title = dec((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
        const desc = dec((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
        const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
        if (!title) problems.push(`${p}: no title`);
        if (titles.has(title)) problems.push(`${p}: title duplicates ${titles.get(title)}`);
        titles.set(title, p);
        if (!desc) problems.push(`${p}: no description`);
        if (desc.length > 160) problems.push(`${p}: description ${desc.length} characters`);
        if (canonical.replace(/\/$/, "") !== HOST + (p === "/" ? "" : p)) problems.push(`${p}: canonical ${canonical}`);
        // A local build has no NEXT_PUBLIC_SITE_URL and so noindexes everything on purpose (app/layout.tsx); only a configured build is judged.
        if (configured && /<meta name="robots" content="[^"]*noindex/i.test(html)) problems.push(`${p}: noindex`);
        const h1 = (html.match(/<h1[\s>]/g) || []).length;
        if (h1 !== 1) problems.push(`${p}: ${h1} h1 elements`);
      }
    }),
  );
  expect(problems).toEqual([]);
});

test("filtered tour views are not indexed and point their canonical at /tours", async ({ request }) => {
  const html = await (await request.get("/tours?category=cruises")).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
  expect(html).toContain(`<link rel="canonical" href="${HOST}/tours"`);
});

test("experience titles name the topic instead of the editorial heading", async ({ request }) => {
  for (const [path, word] of [
    ["/experiences/thermal-baths", /Thermal Baths/],
    ["/experiences/danube", /Danube/],
    ["/experiences/food-and-markets", /Food/],
  ] as const) {
    const html = await (await request.get(path)).text();
    expect(dec((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "")).toMatch(word);
  }
});

test("the attractions page links every place in plain HTML, without JavaScript", async ({ request }) => {
  const paths = (await sitemapPaths(request)).filter((p) => p.startsWith("/attractions/"));
  const html = await (await request.get("/attractions")).text();
  const section = html.slice(html.indexOf('id="all-places"'));
  const linked = new Set([...section.matchAll(/href="(\/attractions\/[a-z0-9-]+)"/g)].map((m) => m[1]));
  const missing = paths.filter((p) => !linked.has(p));
  expect(missing).toEqual([]);
});

for (const slug of ["chain-bridge", "st-stephens-basilica", "szentendre-old-town", "fiumei-road-national-graveyard-kerepesi"]) {
  test(`attraction quick answers: ${slug}`, async ({ page }) => {
    const res = await page.goto(`/attractions/${slug}`);
    expect(res?.status()).toBe(200);
    const box = page.getByTestId("quick-answers");
    await expect(box).toBeVisible();
    const questions = await box.locator("dt").allTextContents();
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0]).toMatch(/^Where is /);
    // The FAQ markup says exactly what the page shows.
    const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || "{}")));
    const faq = ld.find((d) => d["@type"] === "FAQPage");
    expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(questions);
    const answers = await box.locator("dd").allTextContents();
    faq.mainEntity.forEach((q: { acceptedAnswer: { text: string } }, i: number) => expect(answers[i]).toContain(q.acceptedAnswer.text));
    // Nothing that looks like a price or an opening time.
    for (const a of answers) {
      expect(a).not.toMatch(/[€$£]\s?\d|\d\s?(EUR|HUF|Ft)\b/);
      expect(a).not.toMatch(/\b\d{1,2}[:.]\d{2}\s?(am|pm)?\b/i);
    }
    expect((await page.locator('meta[name="description"]').getAttribute("content"))!.length).toBeLessThanOrEqual(160);
  });
}

test("About page: what the site is, how booking works, affiliate disclosure, no invented claims", async ({ page }) => {
  const res = await page.goto("/about");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "About GoToBudapest" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tours, tickets and booking partners" })).toBeVisible();
  const text = await page.locator("main").innerText();
  expect(text).toMatch(/no payment system of its own/);
  expect(text).toMatch(/commission/);
  expect(text).not.toMatch(/TourDesk/); // paused: only providers in use are named
  expect(text).not.toMatch(/\b(award|best|number one|#1|trusted by)\b/i);
  await expect(page.locator('main a[href="/privacy#affiliate"]')).toHaveCount(1);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${HOST}/about`);
  const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || "{}")));
  expect(ld.some((d) => d["@type"] === "AboutPage")).toBe(true);
  await expect(page.locator("footer a[href='/about']")).toHaveCount(1);
});

test("the sitemap lists /about and carries a lastmod for every neighbourhood", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(`${HOST}/about`);
  const hoods = [...xml.matchAll(/<url>\s*<loc>[^<]*\/neighbourhoods\/[a-z0-9-]+<\/loc>([\s\S]*?)<\/url>/g)];
  expect(hoods.length).toBeGreaterThanOrEqual(35);
  for (const h of hoods) expect(h[1]).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
});
