import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

// axe-core runs inside the page; the project only needs the library file, no extra Playwright integration package.

const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

export type AxeNode = { target: string; html: string };
export type AxeViolation = { id: string; impact: string | null; help: string; nodes: AxeNode[] };

// WCAG 2.0/2.1/2.2 A and AA plus axe's best-practice rules.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

export async function runAxe(page: Page): Promise<AxeViolation[]> {
  if (!(await page.evaluate(() => "axe" in window))) await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async (tags) => {
    // @ts-expect-error axe is injected above
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
    return r.violations.map((v: { id: string; impact: string | null; help: string; nodes: { target: unknown[]; html: string }[] }) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target.join(" "), html: n.html.slice(0, 160) })),
    }));
  }, TAGS);
  return result as AxeViolation[];
}

export const blocking = (violations: AxeViolation[]) => violations.filter((v) => v.impact === "critical" || v.impact === "serious");
export const describe = (violations: AxeViolation[]) =>
  violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.map((n) => n.target).join(" | ")}`).join("\n");

// Heading outline: exactly one h1 and no skipped levels (h2 -> h4).
export async function headingProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => (h as HTMLElement).offsetParent !== null || getComputedStyle(h).position === "fixed");
    const problems: string[] = [];
    const h1 = hs.filter((h) => h.tagName === "H1").length;
    if (h1 !== 1) problems.push(`${h1} h1 elements`);
    let last = 0;
    for (const h of hs) {
      const level = Number(h.tagName[1]);
      if (last && level > last + 1) problems.push(`heading level jumps from h${last} to h${level}: "${(h.textContent ?? "").trim().slice(0, 50)}"`);
      last = level;
    }
    return problems;
  });
}

// Tabs through the page and reports interactive elements that take focus without any visible indicator
// (an outline, a box shadow or a changed border/background compared with the unfocused state is not required;
// the rule here is the common one: outline or box-shadow must be present while focused).
export async function focusProblems(page: Page, maxTabs = 25): Promise<string[]> {
  const problems: string[] = [];
  // Smooth scrolling would still be moving when the position is read.
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      // The ring may sit on the element itself or on a wrapper that shows :focus-within (a search field in a pill).
      const ringed = (node: Element) => {
        const c = getComputedStyle(node);
        return { outline: c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0, shadow: c.boxShadow !== "none" };
      };
      let outline = ringed(el).outline;
      let shadow = ringed(el).shadow;
      for (let p = el.parentElement, depth = 0; p && depth < 3 && !outline && !shadow; p = p.parentElement, depth++) {
        if (p.matches(":focus-within")) ({ outline, shadow } = ringed(p));
      }
      const visible = !!(el.offsetWidth || el.offsetHeight);
      const r = el.getBoundingClientRect();
      // a skip link is allowed to sit off screen until it is focused; after focus it must be on screen
      const onScreen = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
      return { tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), outline, shadow, visible, onScreen };
    });
    if (!info) continue;
    if (info.visible && !info.outline && !info.shadow) problems.push(`no visible focus style on <${info.tag}> "${info.text}"`);
    if (info.visible && !info.onScreen) problems.push(`focused element is off screen: <${info.tag}> "${info.text}"`);
  }
  return problems;
}
