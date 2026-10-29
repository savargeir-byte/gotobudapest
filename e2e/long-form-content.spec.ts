import { expect, test } from "@playwright/test";

// The long-form visitor text, the new histories and the extra guide sections render on the real pages,
// with their sources linked and their photographs credited.
test.describe("long-form attraction pages", () => {
  for (const [slug, name, fact] of [
    ["hungarian-parliament", "Hungarian Parliament", "Imre Steindl"],
    ["szechenyi-thermal-bath", "Széchenyi Thermal Bath", "June 1913"],
    ["gellert-thermal-bath", "Gellért Thermal Bath", "closed in October 2025"],
    ["heroes-square", "Heroes’ Square", "Memorial Stone of Heroes"],
    ["dohany-street-synagogue", "Dohány Street Synagogue", "6 September 1859"],
  ] as const) {
    test(`${slug}: about text, good-to-know list and linked sources`, async ({ page }) => {
      await page.goto(`/attractions/${slug}`);
      const about = page.locator("section", { has: page.getByRole("heading", { level: 2, name: `About ${name}` }) });
      await expect(about).toBeVisible();
      await expect(about).toContainText(fact);
      await expect(about.getByRole("heading", { level: 3, name: "Good to know" })).toBeVisible();
      expect(await about.locator("ul li").count()).toBeGreaterThanOrEqual(5); // tips and sources
      const sources = about.getByRole("heading", { level: 3, name: "Sources" }).locator("xpath=following-sibling::ul[1]//a");
      expect(await sources.count()).toBeGreaterThanOrEqual(2);
      for (const a of await sources.all()) {
        await expect(a).toHaveAttribute("href", /^https:\/\//);
        await expect(a).toHaveAttribute("rel", "noopener noreferrer");
      }
      await expect(about).toContainText("Facts checked against these sources on 2026-10-29");
      // the visible description is the long one, not the one-line seed
      expect((await page.locator("main").innerText()).split(/\s+/).length).toBeGreaterThan(350);
    });
  }

  test("an attraction without long-form text is unchanged (no empty About section)", async ({ page }) => {
    await page.goto("/attractions/chain-bridge");
    await expect(page.getByRole("heading", { level: 2, name: /^About / })).toHaveCount(0);
  });

  test("a new history appears for Heroes' Square with its cited article", async ({ page }) => {
    await page.goto("/attractions/heroes-square");
    await expect(page.getByRole("heading", { name: "Statues that followed the politics of the day" })).toBeVisible();
    const wikiHref = await page.getByRole("link", { name: /Heroes' Square \(Budapest\) \(Wikipedia\)/ }).first().getAttribute("href");
    expect(wikiHref).not.toBeNull();
    expect(new URL(wikiHref!).hostname).toBe("en.wikipedia.org");
  });

  test("Budapest Gallery now has a credited hero photograph", async ({ page }) => {
    await page.goto("/attractions/budapest-gallery");
    const hero = page.locator("main img[src*='budapest-gallery']").first();
    await expect(hero).toHaveAttribute("alt", /Budapest Gallery/);
    await expect(page.locator("main")).toContainText("Gámán Zsuzsa");
    await expect(page.getByRole("link", { name: "CC BY-SA 4.0" }).first()).toHaveAttribute("href", "https://creativecommons.org/licenses/by-sa/4.0");
  });
});

test.describe("expanded guides", () => {
  for (const [slug, id, text, photo] of [
    ["budapest-in-3-days", "landmarks-at-a-glance", "364 steps", "heroes-square"],
    ["budapest-thermal-baths", "bath-history", "Sokollu Mustafa Pasha", "lukacs-thermal-bath"],
    ["buda-castle-district", "castle-hill-timeline", "Zero Kilometre Stone", "hungarian-national-gallery"],
    ["danube-cruises", "what-you-see-from-the-water", "Margaret Island", "fishermans-bastion"],
    ["downtown-pest-walking-guide", "stops-with-a-story", "24 February 2002", "dohany-street-synagogue"],
  ] as const) {
    test(`${slug}: new section with its credited inline photo`, async ({ page }) => {
      await page.goto(`/guides/${slug}`);
      const section = page.locator(`#${id}`);
      await expect(section).toBeVisible();
      await expect(section).toContainText(text);
      const figure = page.locator(`figure:has(img[src*="${photo}"])`).last();
      await expect(figure).toBeVisible();
      await expect(figure.locator("img")).toHaveAttribute("alt", /.{20,}/);
      await expect(figure).toContainText(/Photo:/);
    });
  }
});
