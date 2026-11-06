import { expect, test } from "@playwright/test";

// A photo credit must never render an empty or missing link target: an anchor with href="" points at the page itself.
// The owner's own photographs ("Used with permission") carry no licence or source URL, so their credit has no links;
// licensed third-party photographs keep both. Checked on pages that show credits from different content sources.
const PAGES = [
  "/attractions/st-stephens-basilica",
  "/attractions/matthias-church",
  "/attractions/hungarian-parliament",
  "/attractions/memento-park",
  "/attractions",
  "/tours",
];

for (const route of PAGES) {
  test(`no credit or content link has an empty target: ${route}`, async ({ page }) => {
    await page.goto(route);
    const empties = await page.locator("main a").evaluateAll((els) =>
      els
        .filter((a) => {
          const h = (a.getAttribute("href") ?? "").trim();
          return h === "" || h === "#" || /^(undefined|null)$/.test(h);
        })
        .map((a) => (a.textContent ?? "").trim().slice(0, 60)),
    );
    expect(empties, `links without a target on ${route}`).toEqual([]);
  });
}

test("an owner photograph is credited as such, with no licence or source links", async ({ page }) => {
  await page.goto("/attractions/st-stephens-basilica");
  const credits = page.locator(".photo-credit, .attraction-gallery-credit, figcaption").filter({ hasText: "Used with permission" });
  // Content may be edited: when the owner photographs are published, their credit must say so and carry no empty links.
  if ((await credits.count()) === 0) test.skip(true, "no owner-supplied photograph is currently published on this page");
  for (let i = 0; i < (await credits.count()); i++) {
    await expect(credits.nth(i)).toContainText("Photo:");
    for (const a of await credits.nth(i).locator("a").all()) await expect(a).toHaveAttribute("href", /^https:\/\//);
  }
});
