import { expect, test } from "@playwright/test";

test("Hospital in the Rock shows a 6-photo museum gallery and sourced history", async ({ page }) => {
  const result = await page.goto("/attractions/hospital-in-the-rock");
  expect(result?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Hospital in the Rock in pictures" })).toBeVisible();
  await expect(page.locator(".attraction-gallery-tile")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "History of Hospital in the Rock" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The surgeon who wore a recovered bullet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A persistent myth about Soviet flamethrowers" })).toBeVisible();

  const images = page.locator(".attraction-gallery-tile img");
  await expect(images).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    const src = await images.nth(i).getAttribute("src");
    expect(src).toContain("cdn.sanity.io/images/ut6qxuke/production/");
    await expect(images.nth(i)).toHaveAttribute("alt", /\S+/);
    await expect(page.locator(".attraction-gallery-tile").nth(i).getByRole("link", { name: "CC BY-SA 4.0" })).toBeVisible();
    await expect(page.locator(".attraction-gallery-tile").nth(i).getByRole("link", { name: "Source ↗" })).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("Gallery lightbox opens, navigates with arrow keys, and closes on Escape", async ({ page }) => {
  await page.goto("/attractions/hospital-in-the-rock");
  await page.getByRole("button", { name: /View photograph 1 of 6/ }).click();
  const dialog = page.getByRole("dialog", { name: /Hospital in the Rock image gallery/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-label", /image 1 of 6/);
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toHaveAttribute("aria-label", /image 2 of 6/);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("Gallery template also works for other major attractions", async ({ page }) => {
  for (const slug of ["fishermans-bastion", "matthias-church", "szechenyi-thermal-bath", "hungarian-parliament", "great-market-hall"]) {
    await page.goto(`/attractions/${slug}`);
    expect(await page.locator(".attraction-gallery-tile").count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator(".attraction-history h2").first()).toBeVisible();
  }
});
