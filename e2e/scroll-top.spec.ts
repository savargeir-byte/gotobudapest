import { expect, test, type Page } from "@playwright/test";

// Site-wide rule: an internal link to a DIFFERENT page opens that page at the top,
// instantly (no slide from the old offset); anchors, same-page updates and
// Back/Forward are the documented exceptions. Local production build, no providers.

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

async function scrollNearBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => window.scrollY > 800);
}

// Reads scroll positions in the first frames after the URL changes. The browser updates the
// URL a moment BEFORE React commits the new page, so the first sample(s) may still show the
// untouched old offset. What must never happen is a slide: a changing, non-zero offset. So the
// leading non-zero samples must all be the same untouched offset, followed only by zeros.
async function expectInstantTop(page: Page, urlPattern: RegExp) {
  await page.waitForURL(urlPattern);
  const samples: number[] = [];
  for (let i = 0; i < 12; i++) {
    samples.push(await scrollY(page));
    await page.waitForTimeout(60);
  }
  const firstZero = samples.indexOf(0);
  const note = `scroll samples ${samples.join(",")}`;
  expect(firstZero, note).toBeGreaterThanOrEqual(0);
  expect(samples.slice(firstZero).every((y) => y === 0), note).toBe(true);
  expect(new Set(samples.slice(0, firstZero)).size, note).toBeLessThanOrEqual(1);
  await expect(page.locator("h1").first()).toBeInViewport();
}

async function clickFromBottom(page: Page, locator: ReturnType<Page["locator"]>) {
  await locator.scrollIntoViewIfNeeded();
  expect(await scrollY(page)).toBeGreaterThan(500);
  await locator.click();
}

test.describe("internal navigation starts at the top", () => {
  test("homepage guide card", async ({ page }) => {
    await page.goto("/");
    await scrollNearBottom(page);
    await clickFromBottom(page, page.locator("#travel-guides .guide-card h3 a").last());
    await expectInstantTop(page, /\/guides\/[^/]+$/);
  });

  test("homepage attraction card", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("#explore .cards h3 a").last();
    await clickFromBottom(page, card);
    await expectInstantTop(page, /\/attractions\/[^/]+$/);
  });

  test("footer links, from the bottom of long pages", async ({ page }) => {
    for (const [from, href, target] of [
      ["/", "/essentials", /\/essentials$/],
      ["/attractions/chain-bridge", "/neighbourhoods", /\/neighbourhoods$/],
      ["/guides/danube-cruises", "/experiences", /\/experiences$/],
      ["/tours", "/guides", /\/guides$/],
    ] as const) {
      await page.goto(from);
      await scrollNearBottom(page);
      await clickFromBottom(page, page.locator(`footer a[href="${href}"]`));
      await expectInstantTop(page, target);
    }
  });

  test("header links while the page is scrolled", async ({ page, isMobile }) => {
    await page.goto("/attractions/chain-bridge");
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForFunction(() => window.scrollY > 500);
    if (isMobile) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    }
    await page.locator('header nav a[href="/guides"]').click();
    await expectInstantTop(page, /\/guides$/);
  });

  test("related content cards on guides, experiences and neighbourhoods", async ({ page }) => {
    for (const [from, card, target] of [
      ["/guides/danube-cruises", ".cards .guide-card h3 a", /\/guides\/[^/]+$/],
      ["/experiences/danube", "#places .cards h3 a", /\/attractions\/[^/]+$/],
      ["/neighbourhoods/castle-district", ".cards .guide-card h3 a", /\/guides\/[^/]+$/],
    ] as const) {
      await page.goto(from);
      await scrollNearBottom(page);
      await clickFromBottom(page, page.locator(card).last());
      await expectInstantTop(page, target);
    }
  });

  test("attraction directory cards after Show more", async ({ page }) => {
    await page.goto("/attractions");
    await page.getByRole("button", { name: /Show more places/ }).click();
    await scrollNearBottom(page);
    await clickFromBottom(page, page.locator(".cards h3 a").last());
    await expectInstantTop(page, /\/attractions\/[^/]+$/);
  });
});

test.describe("exceptions keep their behaviour", () => {
  test("in-page anchors go to their section, not the top", async ({ page }) => {
    await page.goto("/guides/danube-cruises");
    await page.locator('.article-toc a[href="#questions"]').click();
    await expect(page).toHaveURL(/#questions$/);
    await page.waitForTimeout(600);
    expect(await scrollY(page)).toBeGreaterThan(300);
    const top = await page.locator("#questions").evaluate((el) => Math.round(el.getBoundingClientRect().top));
    // On short remaining pages the section cannot reach the very top; it must be
    // on screen and the page must not have been reset to 0.
    expect(top).toBeGreaterThanOrEqual(0);
    await expect(page.locator("#questions h2")).toBeInViewport();
  });

  test("changing search parameters on the same page does not jump", async ({ page }) => {
    await page.goto("/attractions?q=park");
    await page.waitForSelector(".cards article");
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForFunction(() => window.scrollY > 300);
    const before = await scrollY(page);
    await page.evaluate(() => {
      window.history.replaceState(null, "", "/attractions?q=park&x=1");
    });
    await page.waitForTimeout(400);
    expect(Math.abs((await scrollY(page)) - before)).toBeLessThan(5);
  });

  test("Back returns to the previous scroll position", async ({ page }) => {
    await page.goto("/guides");
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => window.scrollY > 400);
    const before = await scrollY(page);
    await page.locator(".cards h3 a").last().scrollIntoViewIfNeeded();
    const clickedAt = await scrollY(page);
    await page.locator(".cards h3 a").last().click();
    await expectInstantTop(page, /\/guides\/[^/]+$/);
    await page.goBack();
    await page.waitForURL(/\/guides$/);
    await page.waitForTimeout(600);
    const after = await scrollY(page);
    // Restored to (about) where the visitor left the listing, not reset to 0. The
    // browser clamps restoration while lazy images/layout settle, hence the tolerance.
    expect(after, `before ${before}, clicked at ${clickedAt}`).toBeGreaterThan(clickedAt / 2);
  });

  test("a new page never opens hidden under the header or mid-page", async ({ page }) => {
    await page.goto("/");
    await clickFromBottom(page, page.locator(".experience-row").last());
    await expectInstantTop(page, /\/experiences\/[^/]+$/);
    const h1 = await page.locator("h1").first().boundingBox();
    expect(h1!.y).toBeGreaterThanOrEqual(0);
  });
});
