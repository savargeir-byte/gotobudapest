import { expect, test } from "@playwright/test";
import { describe, focusProblems, headingProblems, runAxe } from "./support/a11y";

// Accessibility budget (T-009): the page templates below must have NO axe-core violation (WCAG 2.0/2.1/2.2 A and AA plus
// best practices), one h1 with no skipped heading levels, and a visible keyboard focus indicator. They run on the desktop
// (1440x900) and mobile (Pixel 7) projects. The marketplace and product pages are covered in
// accessibility-marketplace-ui.spec.ts (mocked providers).
const templates: [string, string][] = [
  ["home", "/"],
  ["attraction directory", "/attractions"],
  ["landmark with gallery and tours", "/attractions/matthias-church"],
  ["sacred architecture", "/attractions/st-elizabeth-church-roses-square"],
  ["synagogue with gallery", "/attractions/rumbach-street-synagogue"],
  ["thermal bath", "/attractions/szechenyi-thermal-bath"],
  ["museum with history", "/attractions/hospital-in-the-rock"],
  ["park", "/attractions/margaret-island"],
  ["place without a photograph", "/attractions/szamos-chocolate-museum"],
  ["guide directory", "/guides"],
  ["guide: getting around", "/guides/getting-around-budapest"],
  ["guide: three days", "/guides/budapest-in-3-days"],
  ["experience", "/experiences/danube"],
  ["neighbourhood", "/neighbourhoods/castle-district"],
  ["essentials", "/essentials"],
];

for (const [label, url] of templates) {
  test(`accessibility: ${label} (${url})`, async ({ page }) => {
    const res = await page.goto(url, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    const violations = await runAxe(page);
    expect(violations, describe(violations)).toEqual([]);
    expect(await headingProblems(page)).toEqual([]);
    expect(await focusProblems(page, 25)).toEqual([]);
  });
}

test("accessibility: the not-found page has a heading and a way back", async ({ page }) => {
  const res = await page.goto("/attractions/this-place-does-not-exist");
  expect(res?.status()).toBe(404);
  expect(await runAxe(page)).toEqual([]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("keyboard: the skip link is the first stop, becomes visible and moves focus to the content", async ({ page }) => {
  await page.goto("/attractions/matthias-church");
  await page.keyboard.press("Tab");
  const skip = page.locator("a.skip");
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box && box.x >= 0 && box.y >= 0, "skip link is on screen while focused").toBe(true);
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#place");
});

test("filters: the search field is labelled, results are announced and category buttons expose their state", async ({ page }) => {
  await page.goto("/attractions");
  const search = page.getByLabel(/^Search \d+ places$/);
  await expect(search).toBeVisible();
  await search.fill("synagogue");
  await expect(page.getByRole("status").first()).toContainText(/\d+ places?/);
  const pressed = page.getByRole("button", { name: "Sacred architecture", pressed: false });
  await search.fill("");
  await pressed.click();
  await expect(page.getByRole("button", { name: "Sacred architecture", pressed: true })).toBeVisible();
  // At least the 16 original places: the new-attraction batches add more sacred places to the same category.
  const countText = (await page.getByRole("status").first().innerText()).match(/(\d+) places/);
  expect(Number(countText?.[1])).toBeGreaterThanOrEqual(16);
  expect(await runAxe(page)).toEqual([]);
});

test("gallery dialog: named dialog, focus moves in, Escape closes it and focus returns to the photograph button", async ({ page }) => {
  await page.goto("/attractions/rumbach-street-synagogue");
  const open = page.locator(".attraction-gallery-open").first();
  await open.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-label", /.+/);
  const inside = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
  expect(inside, "focus is inside the dialog").toBe(true);
  expect(await runAxe(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();
});

test("motion: with prefers-reduced-motion no animation or transition runs longer than a blink", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const slow = await page.evaluate(() => {
    const seconds = (v: string) => v.split(",").map((x) => parseFloat(x) * (x.trim().endsWith("ms") ? 0.001 : 1));
    return [...document.querySelectorAll("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        const anim = cs.animationName !== "none" && Math.max(...seconds(cs.animationDuration)) > 0.05;
        const trans = Math.max(...seconds(cs.transitionDuration)) > 0.25;
        return anim || trans;
      })
      .slice(0, 8)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.getAttribute("class") || "").split(" ")[0]}`);
  });
  expect(slow, "elements that still animate").toEqual([]);
});

test("phone menu: Enter opens it, Escape closes it and focus returns to the menu button", async ({ page }, info) => {
  test.skip(!info.project.name.includes("mobile"), "the menu button exists only on narrow screens");
  await page.goto("/attractions");
  const menu = page.locator("button.menu");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});

test("hero text: at most 2 % of the pixels behind the heading, eyebrow and intro line are below the WCAG contrast need", async ({ page }) => {
  // The text is hidden, the hero is photographed, and the pixels under each text extent are compared with the text colour.
  await page.goto("/", { waitUntil: "networkidle" });
  const result = await page.evaluate(async () => {
    const boxes = [...document.querySelectorAll(".hero-content h1, .hero-content .eyebrow, .hero-content > p")].map((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height, color: cs.color, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) };
    });
    const hero = document.querySelector(".hero")!.getBoundingClientRect();
    return { boxes, hero: { x: hero.left, y: hero.top + scrollY, w: hero.width, h: hero.height } };
  });
  await page.addStyleTag({ content: ".hero-content *{visibility:hidden!important}" });
  const shot = await page.locator(".hero").first().screenshot();
  const { default: sharp } = await import("sharp");
  const meta = await sharp(shot).metadata();
  const raw = await sharp(shot).removeAlpha().raw().toBuffer();
  const lum = (r: number, g: number, b: number) => {
    const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const scale = (meta.width ?? 1) / result.hero.w;
  for (const b of result.boxes) {
    const m = b.color.match(/[\d.]+/g)!.map(Number);
    const tl = lum(m[0], m[1], m[2]);
    const need = b.size >= 24 || (b.size >= 18.66 && b.weight >= 700) ? 3 : 4.5;
    let below = 0, n = 0;
    const x0 = Math.max(0, Math.round((b.x - result.hero.x) * scale)), y0 = Math.max(0, Math.round((b.y - result.hero.y) * scale));
    const x1 = Math.min(meta.width ?? 0, Math.round((b.x - result.hero.x + b.w) * scale)), y1 = Math.min(meta.height ?? 0, Math.round((b.y - result.hero.y + b.h) * scale));
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
      const i = (y * (meta.width ?? 0) + x) * 3;
      const l = lum(raw[i], raw[i + 1], raw[i + 2]);
      const ratio = (Math.max(tl, l) + 0.05) / (Math.min(tl, l) + 0.05);
      if (ratio < need) below++;
      n++;
    }
    expect(n, "sampled pixels").toBeGreaterThan(20);
    expect(below / n, `pixels below ${need}:1 behind ${b.size}px text`).toBeLessThan(0.02);
  }
});
