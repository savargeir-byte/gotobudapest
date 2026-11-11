// Quality gate for the neighbourhood editorial data (used by tests/neighbourhood-editorial.test.ts).
import { GUIDE_SLUGS, words } from "../new-attractions/validate";
import type { NeighbourhoodEditorial } from "./types";

const MONEY = /([€$£]\s?\d|\d\s?(€|\$|£|EUR\b|USD\b|HUF\b|Ft\b|forints?\b|euros?\b))/i;
const CLOCK = /\b([01]?\d|2[0-3])[:.][0-5]\d\s?(am|pm|h)?\b(?!\s?(km|m\b|metres|meters|%))/i;
const HOURS = /\b(opens? (at|every|daily|from|until)|opening hours|opening times|open (daily|every day|from|until|all year|year[- ]round)|closes? (at|every|daily|from)|closing time|daily from|admission is free|free admission|free entry|free of charge|entry is free)\b/i;

export type Problem = { slug: string; problem: string };

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function validateEditorial(e: NeighbourhoodEditorial, hoods: Set<string>, places: Set<string>): Problem[] {
  const out: Problem[] = [];
  const bad = (problem: string) => out.push({ slug: e.slug, problem });
  if (!hoods.has(e.slug)) bad("unknown neighbourhood slug");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.checked ?? "")) bad("checked must be YYYY-MM-DD");
  const paras = (e.sections ?? []).flatMap((s) => s.paragraphs ?? []);
  const n = paras.reduce((a, p) => a + words(p), 0);
  if ((e.sections ?? []).length < 3) bad("at least 3 sections");
  if ((e.sections ?? []).some((s) => !s.title?.trim() || !(s.paragraphs ?? []).length)) bad("section without title or paragraphs");
  if (n < 300 || n > 700) bad(`new editorial has ${n} words (300-700)`);
  for (const t of [...paras, ...(e.highlights ?? [])]) {
    if (MONEY.test(t)) bad(`states a price: "${t.match(MONEY)?.[0]}"`);
    if (CLOCK.test(t)) bad(`states a clock time: "${t.match(CLOCK)?.[0]}"`);
    if (HOURS.test(t)) bad(`states opening or admission conditions: "${t.match(HOURS)?.[0]}"`);
  }
  for (const s of e.placeSlugs ?? []) if (!places.has(s)) bad(`unknown place "${s}"`);
  for (const g of e.guides ?? []) if (!GUIDE_SLUGS.includes(g)) bad(`unknown guide "${g}"`);
  const src = e.sources ?? [];
  if (src.length < 2) bad("at least two sources");
  if (src.some((s) => !s.label?.trim() || !/^https:\/\/[^\s]+$/.test(s.url ?? ""))) bad("source needs label and https url");
  if (!src.some((s) => !/(^|\.)wikipedia\.org$/i.test(hostOf(s.url)))) bad("at least one source must not be Wikipedia");
  if (!e.seo || !e.seo.title || e.seo.title.length > 45) bad("seo.title must be set and at most 45 characters");
  if (!e.seo || (e.seo.description ?? "").length < 80 || e.seo.description.length > 160) bad("seo.description must be 80-160 characters");
  return out;
}
