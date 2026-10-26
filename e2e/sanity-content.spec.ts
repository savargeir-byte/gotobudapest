import { expect, test } from "@playwright/test";

// Proves the pages render Sanity data, not the local fallback files. Run it only
// after the migration, against a build made with Sanity reachable:
//   PW_EXPECT_SANITY=1 npx playwright test e2e/sanity-content.spec.ts
// Local fallback images live under /assets, Sanity images under cdn.sanity.io.
test.skip(!process.env.PW_EXPECT_SANITY, "set PW_EXPECT_SANITY=1 after the Sanity migration");

const sanityImage = /^https:\/\/cdn\.sanity\.io\/images\/ut6qxuke\/production\//;

for (const path of [
  "/attractions/chain-bridge",
  "/guides/danube-cruises",
  "/experiences/danube",
  "/neighbourhoods/castle-district",
]) {
  test(`hero image of ${path} comes from Sanity`, async ({ page }) => {
    await page.goto(path);
    const src = await page.locator("figure img, .article-hero img").first().getAttribute("src");
    expect(src, "hero image src").toMatch(sanityImage);
  });
}

test("the attraction directory shows 100 Sanity-backed cards", async ({ page }) => {
  await page.goto("/attractions");
  await expect(page.locator(".cards article").first()).toBeVisible();
  const withPhoto = await page.locator(".cards article img").evaluateAll(
    (imgs) =>
      imgs.filter((x) => new URL((x as HTMLImageElement).src).hostname === "cdn.sanity.io").length,
  );
  expect(withPhoto).toBeGreaterThan(10);
});
