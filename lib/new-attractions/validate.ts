// Quality gate for the new attractions. Pure functions: used by tests/new-attractions.test.ts and by
// scripts/validate-new-attractions.ts, which writers run on their own file before handing it in.
import type { NewAttraction, NewPhoto } from "./types";

export const CATEGORIES = [
  "Landmarks",
  "Museums",
  "Sacred architecture",
  "Arts & culture",
  "Food & markets",
  "Parks & outdoors",
  "Baths & wellness",
  "Nightlife",
] as const;

export const GUIDE_SLUGS = [
  "buda-castle-district",
  "budapest-bars-nightlife",
  "budapest-food-and-markets",
  "budapest-in-3-days",
  "budapest-thermal-baths",
  "danube-cruises",
  "downtown-pest-walking-guide",
  "getting-around-budapest",
];

const ALLOWED_LICENSE = /^(CC BY(-SA)? [0-9.]+( [a-z]{2,3})?|CC0.*|Public domain)$/i;

export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Things a writer must never state: money, opening times, admission conditions.
const MONEY = /([€$£]\s?\d|\d\s?(€|\$|£|EUR\b|USD\b|HUF\b|Ft\b|forints?\b|euros?\b))/i;
const CLOCK = /\b([01]?\d|2[0-3])[:.][0-5]\d\s?(am|pm|h)?\b(?!\s?(km|m\b|metres|meters|%))/i;
const HOURS = /\b(opens? (at|every|daily|from|until|on (mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|weekdays|weekends))|opening hours|opening times|open (daily|every day|from|until|all year|year[- ]round|on (mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|weekdays|weekends))|closes? (at|every|daily|from|on (mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|weekdays|weekends))|closed (on|every) (mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|weekdays|weekends)|closing time|daily from|admission is free|free admission|free entry|free of charge|entry is free)\b/i;

export type Baseline = {
  sanity: { slug: string; name: string }[];
  local: { slug: string; name: string }[];
  supplements: string[];
  neighbourhoods: { slug: string; title: string }[];
};

export type Issue = { slug: string; problem: string };

function textOf(a: NewAttraction): string[] {
  return [
    a.intro,
    ...a.about,
    ...a.tips,
    a.history.intro,
    ...a.history.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
  ];
}

export function validateAttraction(
  a: NewAttraction,
  baseline: Baseline,
  photos: Record<string, NewPhoto>,
): Issue[] {
  const out: Issue[] = [];
  const bad = (problem: string) => out.push({ slug: a.slug || "(no slug)", problem });

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug ?? "")) bad("slug must be lowercase letters, digits and hyphens");
  if (!a.name?.trim()) bad("name missing");
  if (!a.nameHu?.trim()) bad("Hungarian name (nameHu) missing");
  if (!CATEGORIES.includes(a.category as never)) bad(`category "${a.category}" is not one of ${CATEGORIES.join(", ")}`);
  if (!a.address?.trim()) bad("address missing");

  const c = a.coordinates;
  if (!c || !Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) bad("coordinates missing");
  else if (a.outsideBudapest) {
    if (c.latitude < 46 || c.latitude > 48.6 || c.longitude < 17.5 || c.longitude > 20.6) bad("outsideBudapest coordinates are not in the Budapest region");
    if (c.latitude >= 47.33 && c.latitude <= 47.65 && c.longitude >= 18.9 && c.longitude <= 19.35)
      bad("flagged outsideBudapest but the coordinates are inside Budapest");
  } else if (c.latitude < 47.33 || c.latitude > 47.65 || c.longitude < 18.9 || c.longitude > 19.35)
    bad("coordinates are outside Budapest: set outsideBudapest for a day-trip destination");
  if (!a.outsideBudapest && !a.district?.trim()) bad("district (roman numeral) missing for a place in Budapest");

  const hoods = new Set(baseline.neighbourhoods.map((n) => n.slug));
  // A place may have no neighbourhood when none of the 35 fits (it is then reached through district, nearby places and guides);
  // a neighbourhood that is listed must really be the place's own, never the "nearest" one.
  if (!Array.isArray(a.neighbourhoods)) bad("neighbourhoods must be an array (empty when no published neighbourhood fits)");
  for (const n of a.neighbourhoods ?? []) if (!hoods.has(n)) bad(`unknown neighbourhood "${n}"`);

  const introWords = words(a.intro ?? "");
  if (introWords < 40 || introWords > 70) bad(`intro has ${introWords} words (40-70 required)`);
  const editorial = [...(a.about ?? []), ...(a.history?.sections ?? []).flatMap((s) => s.paragraphs), a.history?.intro ?? ""]
    .map(words)
    .reduce((n, x) => n + x, 0);
  if (editorial < 250) bad(`editorial text has ${editorial} words (250 minimum across About and History)`);
  if ((a.about?.length ?? 0) < 2) bad("About needs at least two paragraphs");
  if ((a.history?.sections?.length ?? 0) < 1) bad("History needs at least one section");
  if ((a.tips?.length ?? 0) < 2) bad("at least two practical tips are required");

  const srcs = a.sources ?? [];
  if (srcs.length < 2) bad("at least two sources are required");
  for (const s of srcs) {
    if (!s.label?.trim() || !/^https:\/\/[^\s]+$/.test(s.url ?? "")) bad(`source needs a label and an https URL: ${s.url}`);
  }
  if (new Set(srcs.map((s) => s.url)).size < srcs.length) bad("duplicate source URLs");
  if (!srcs.some((s) => !/wikipedia\.org/i.test(s.url ?? ""))) bad("at least one source must not be Wikipedia (official or institutional)");

  const all = textOf(a);
  for (const t of all) {
    if (MONEY.test(t)) bad(`states a price: "${t.match(MONEY)?.[0]}"`);
    if (CLOCK.test(t)) bad(`states a clock time: "${t.match(CLOCK)?.[0]}"`);
    if (HOURS.test(t)) bad(`states opening or admission conditions: "${t.match(HOURS)?.[0]}"`);
  }

  if (!/^[A-Z]/.test(a.intro ?? "")) bad("intro should start with a capital letter");
  if (!a.seo || (a.seo.title ?? "").length === 0 || a.seo.title.length + " | GoToBudapest".length > 60)
    bad(`seo.title must be set and at most 45 characters (is ${a.seo?.title?.length ?? 0})`);
  if (!a.seo || (a.seo.description ?? "").length < 80 || a.seo.description.length > 160)
    bad(`seo.description must be 80-160 characters (is ${a.seo?.description?.length ?? 0})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.checked ?? "")) bad("checked must be a YYYY-MM-DD date");

  for (const g of a.relatedGuides ?? []) if (!GUIDE_SLUGS.includes(g)) bad(`unknown guide "${g}"`);

  const known = new Set([...baseline.sanity.map((x) => x.slug), ...baseline.local.map((x) => x.slug), ...baseline.supplements]);
  for (const r of a.relatedPlaces ?? []) if (!known.has(r)) bad(`relatedPlaces "${r}" is not an existing attraction (use only baseline slugs)`);
  if ((a.relatedPlaces ?? []).includes(a.slug)) bad("relatedPlaces lists the place itself");

  if (a.photoStatus === "ok") {
    const p = a.photoKey ? photos[a.photoKey] : undefined;
    if (!p) bad(`photoStatus "ok" but no photo registry entry for "${a.photoKey}"`);
    else {
      if (!p.alt || p.alt.length < 20) bad("photo alt text too short");
      if (!p.credit?.author || !p.credit?.sourceUrl || !p.credit?.licenseUrl) bad("photo credit incomplete (author, licence URL and source URL are required)");
      if (!ALLOWED_LICENSE.test(p.credit?.license ?? "")) bad(`photo licence "${p.credit?.license}" is not allowed`);
      if (!/^\/assets\/photos\/[a-z0-9-]+-(640|1280)\.webp$/.test(p.src640) || !/^\/assets\/photos\/[a-z0-9-]+-1280\.webp$/.test(p.src1280))
        bad("photo files must be /assets/photos/<name>-640.webp and -1280.webp");
    }
  } else if (a.photoStatus === "needs-photography") {
    if (a.photoKey) bad("needs-photography must have photoKey null");
  } else bad(`photoStatus must be "ok" or "needs-photography"`);

  return out;
}

export function validateBatch(
  list: NewAttraction[],
  baseline: Baseline,
  photos: Record<string, NewPhoto>,
): Issue[] {
  const out: Issue[] = [];
  const slugs = new Map<string, number>();
  const baseSlugs = new Set([...baseline.sanity.map((x) => x.slug), ...baseline.local.map((x) => x.slug), ...baseline.supplements]);
  const baseNames = new Map<string, string>();
  for (const b of [...baseline.sanity, ...baseline.local]) baseNames.set(norm(b.name), b.slug);
  const names = new Map<string, string>();
  for (const a of list) {
    out.push(...validateAttraction(a, baseline, photos));
    slugs.set(a.slug, (slugs.get(a.slug) ?? 0) + 1);
    if (baseSlugs.has(a.slug)) out.push({ slug: a.slug, problem: "slug already exists in Sanity, the local list or the supplements" });
    const nn = norm(a.name);
    if (baseNames.has(nn)) out.push({ slug: a.slug, problem: `name duplicates existing attraction "${baseNames.get(nn)}"` });
    if (names.has(nn)) out.push({ slug: a.slug, problem: `name duplicates "${names.get(nn)}" in this batch` });
    names.set(nn, a.slug);
  }
  for (const [s, n] of slugs) if (n > 1) out.push({ slug: s, problem: `slug appears ${n} times` });
  return out;
}
