// Accessibility of the tours marketplace and the internal product pages (T-009). ALL MOCKED: the site is served by the
// dedicated `next start` on port 3101 whose provider calls go to e2e/support/mock-provider.mjs; every non-local browser
// request is intercepted. These tests audit the page structure; they say nothing about live inventory or prices.
import { expect, test, type Page } from "@playwright/test";
import { describe, focusProblems, headingProblems, runAxe } from "./support/a11y";

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#0a2a3a"/></svg>';
async function prepare(page: Page) {
  await page.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      if (req.resourceType() === "image") return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg });
      return route.abort();
    },
  );
}
async function audit(page: Page) {
  const violations = await runAxe(page);
  expect(violations, describe(violations)).toEqual([]);
  expect(await headingProblems(page)).toEqual([]);
  expect(await focusProblems(page, 25)).toEqual([]);
}

test.describe("marketplace accessibility (mocked providers)", () => {
  for (const url of ["/tours", "/tours?provider=viator", "/tours?provider=tiqets", "/tours?category=cruises&sort=price-asc"]) {
    test(`${url}: no axe violations, a clean heading outline and visible focus`, async ({ page }) => {
      await prepare(page);
      const res = await page.goto(url, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.locator(".mk-card").first()).toBeVisible();
      await audit(page);
    });
  }

  test("product cards: every card has one link with an accessible name and the images have alternative text", async ({ page }) => {
    await prepare(page);
    await page.goto("/tours");
    const bad = await page.locator(".mk-card").evaluateAll((els) =>
      els.flatMap((el) => {
        const links = [...el.querySelectorAll("a")].filter((a) => !a.closest(".mk-venue-credit"));
        const problems: string[] = [];
        if (links.length !== 1) problems.push(`${links.length} product links`);
        for (const a of links) if (!(a.textContent || a.getAttribute("aria-label") || "").trim()) problems.push("link without a name");
        for (const img of el.querySelectorAll("img")) if (img.getAttribute("alt") === null) problems.push("image without alt attribute");
        return problems;
      }),
    );
    expect(bad).toEqual([]);
  });

  test("filters and sorting: labelled controls, announced result count", async ({ page }, info) => {
    test.skip(info.project.name.includes("mobile"), "the narrow-screen drawer is covered in marketplace-ui.spec.ts");
    await prepare(page);
    await page.goto("/tours");
    const controls = await page.locator("select, input:not([type=hidden])").evaluateAll((els) =>
      els.filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => {
        const id = el.getAttribute("id");
        const labelled = !!el.getAttribute("aria-label") || !!el.getAttribute("aria-labelledby") || (id && !!document.querySelector(`label[for="${id}"]`)) || !!el.closest("label");
        return labelled ? null : `${el.tagName.toLowerCase()}#${id ?? ""}`;
      }).filter(Boolean),
    );
    expect(controls, "unlabelled controls").toEqual([]);
    await expect(page.getByRole("status").first()).toBeVisible();
  });

  test("viator and tiqets product pages: axe, outline, focus and the availability dialog", async ({ page }) => {
    await prepare(page);
    for (const provider of ["viator", "tiqets"]) {
      await page.goto(`/tours?provider=${provider}`);
      const card = page.locator(`.mk-card[data-provider="${provider}"]`).first();
      await expect(card).toBeVisible();
      await card.getByRole("link", { name: /View details/ }).click();
      await expect(page).toHaveURL(new RegExp(`/tours/${provider}/`));
      await page.waitForLoadState("networkidle");
      await audit(page);
    }
    // The date picker of a Viator product opens a named dialog that keeps focus inside and returns it on Escape.
    await page.goto("/tours?provider=viator");
    await page.locator('.mk-card[data-provider="viator"]').first().getByRole("link", { name: /View details/ }).click();
    const trigger = page.locator(".booking-date-trigger");
    if (await trigger.count()) {
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Choose a date" });
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      const violations = await runAxe(page);
      expect(violations, describe(violations)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  });
});
