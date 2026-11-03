import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { evaluate, parse } from "groq-js";
import { attractionsQuery, experiencesQuery, guidesQuery, neighbourhoodsQuery } from "../lib/sanity/queries";
import { mapAttraction, mapGuide, mapTopic } from "../lib/sanity/mappers";
import { localContent } from "../lib/local-content";
import { blocksToPlainText } from "../lib/portable-text";
import type { Photo } from "../lib/types";

// Field-level fidelity: what the website renders from Sanity must equal what it renders from the local files, so that publishing the
// seeded dataset cannot silently change a credit line, an address, a section text or a FAQ. Image URLs differ by design (the Sanity CDN
// against /assets), so photos are compared by alt, caption and the whole credit instead.

type Doc = { _id: string; _type: string; [k: string]: unknown };
const dir = mkdtempSync(join(tmpdir(), "gtb-fidelity-"));
const dump = join(dir, "docs.json");
execFileSync(process.execPath, ["--import", "tsx", "scripts/sanity-seed.ts", "--dry-run"], {
  env: { ...process.env, SANITY_SEED_DUMP: dump },
  stdio: "pipe",
});
const { docs, patches } = JSON.parse(readFileSync(dump, "utf8")) as {
  docs: Doc[];
  patches: { id: string; fields: Record<string, unknown> }[];
};
const fixRefs = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(fixRefs);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [
        k,
        k === "_ref" && typeof x === "string" && x.startsWith("image-dryrun-")
          ? "image-" + x.replace(/\W/g, "").padEnd(40, "a").slice(0, 40) + "-1280x800-webp"
          : fixRefs(x),
      ]),
    );
  }
  return v;
};
const dataset = (docs.map(fixRefs) as Doc[]).map((d) => {
  const extra = patches.filter((p) => p.id === d._id).reduce((acc, p) => ({ ...acc, ...p.fields }), {});
  return { ...extra, ...d, ...Object.fromEntries(Object.entries(extra).filter(([k]) => !(k in d))) };
});
const run = async <T>(query: string) => (await (await evaluate(parse(query), { dataset })).get()) as T;
const local = localContent();

// The seed upgrades creativecommons.org links to https (scripts/sanity-seed.ts, toHttps); that is the only URL change it makes.
const href = (u?: string) => {
  try {
    return u ? new URL(u.replace(/^http:\/\/creativecommons\.org\//, "https://creativecommons.org/")).href : "";
  } catch {
    return u ?? "";
  }
};
const sameUrl = (a?: string, b?: string) => href(a) === href(b);
// credit.title is not rendered by any component. Local gallery images carry an internal key there ("bridge"), the dataset leaves it empty
// rather than store a key as a "source file title", so the gallery comparison skips it. A guide's hero caption is mapped to
// imageCaption and compared there.
const credit = (p?: Photo, title = true) =>
  p?.credit
    ? { ...(title ? { title: p.credit.title } : {}), author: p.credit.author, license: p.credit.license, licenseUrl: href(p.credit.licenseUrl), sourceUrl: href(p.credit.sourceUrl) }
    : undefined;
const photoView = (p?: Photo, o: { title?: boolean; caption?: boolean } = {}) =>
  p ? { alt: p.alt, ...(o.caption === false ? {} : { caption: p.caption }), credit: credit(p, o.title !== false) } : undefined;
const text = (blocks?: Parameters<typeof blocksToPlainText>[0]) => (blocks ? blocksToPlainText(blocks) : "");

test("attraction fields: every rendered field equals the local content, including hero credit and long-form text", async () => {
  const mapped = (await run<never[]>(attractionsQuery)).map(mapAttraction).filter((a) => a !== undefined);
  const mismatches: string[] = [];
  for (const l of local.attractions) {
    const m = mapped.find((a) => a.slug === l.slug)!;
    const same = (field: string, a: unknown, b: unknown) => {
      if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) mismatches.push(`${l.slug}.${field}: ${JSON.stringify(a)?.slice(0, 300)} != ${JSON.stringify(b)?.slice(0, 300)}`);
    };
    same("name", m.name, l.name);
    same("category", m.category, l.category);
    same("description", m.description, l.description);
    same("address", m.address, l.address);
    same("status", m.status, l.status);
    same("notice", m.notice, l.notice);
    same("checked", m.checked, l.checked);
    same("sourceLabel", m.sourceLabel, l.sourceLabel);
    if (!sameUrl(m.sourceUrl, l.sourceUrl) && m.sourceUrl.replace(/\/$/, "") !== l.sourceUrl.replace(/\/$/, "")) same("sourceUrl", m.sourceUrl, l.sourceUrl);
    if (!sameUrl(m.additionalSource, l.additionalSource)) same("additionalSource", m.additionalSource, l.additionalSource);
    same("coordinates", m.coordinates, l.coordinates);
    same("relatedGuides", m.relatedGuides ?? [], l.relatedGuides ?? []);
    same("seo", m.seo, l.seo);
    same("long-form text", text(m.body), text(l.body));
    same("hero photo", photoView(m.photo), photoView(l.photo));
    const lg = l.gallery ?? [];
    const mg = m.gallery ?? [];
    same("gallery", mg.map((p) => photoView(p, { title: false })), lg.map((p) => photoView(p, { title: false })));
  }
  assert.deepEqual(mismatches.slice(0, 20), [], `${mismatches.length} field mismatches`);
});

test("guide fields: titles, intro, highlights, section text, FAQ text, sources, caption, credit and update date equal the local content", async () => {
  const mapped = (await run<never[]>(guidesQuery)).map((g) => mapGuide(g, local.guides[0].photo)).filter((g) => g !== undefined);
  const mismatches: string[] = [];
  for (const l of local.guides) {
    const m = mapped.find((g) => g.slug === l.slug)!;
    const same = (field: string, a: unknown, b: unknown) => {
      if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) mismatches.push(`${l.slug}.${field}: ${JSON.stringify(a)?.slice(0, 300)} != ${JSON.stringify(b)?.slice(0, 300)}`);
    };
    same("title", m.title, l.title);
    same("shortTitle", m.shortTitle, l.shortTitle);
    same("category", m.category, l.category);
    same("description", m.description, l.description);
    same("intro", m.intro, l.intro);
    same("highlights", m.highlights, l.highlights);
    same("updated", m.updated, l.updated);
    same("imageCaption", m.imageCaption, l.imageCaption);
    // Without an seo object the page uses the description, which is what the seed writes into seo.description.
    same("seo description", m.seo?.description ?? m.description, l.seo?.description ?? l.description);
    same("photo", photoView(m.photo, { caption: false }), photoView(l.photo, { caption: false }));
    same("section titles", m.sections.map((s) => s.title), l.sections.map((s) => s.title));
    same("section text", m.sections.map((s) => text(s.body)), l.sections.map((s) => text(s.body)));
    same("faqs", m.faqs, l.faqs);
    same("sources", m.sources.map((s) => [s.label, href(s.url)]), l.sources.map((s) => [s.label, href(s.url)]));
  }
  assert.deepEqual(mismatches.slice(0, 20), [], `${mismatches.length} field mismatches`);
});

test("experience and neighbourhood fields equal the local content", async () => {
  const mismatches: string[] = [];
  for (const [query, list] of [[experiencesQuery, local.experiences], [neighbourhoodsQuery, local.neighbourhoods]] as const) {
    const mapped = (await run<never[]>(query)).map((t) => mapTopic(t, local.experiences[0].photo)).filter((t) => t !== undefined);
    for (const l of list) {
      const m = mapped.find((t) => t.slug === l.slug)!;
      const same = (field: string, a: unknown, b: unknown) => {
        if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) mismatches.push(`${l.slug}.${field}: ${JSON.stringify(a)?.slice(0, 300)} != ${JSON.stringify(b)?.slice(0, 300)}`);
      };
      same("title", m.title, l.title);
      same("description", m.description, l.description);
      same("intro", m.intro, l.intro);
      same("section text", m.sections.map((s) => [s.title, text(s.body)]), l.sections.map((s) => [s.title, text(s.body)]));
      same("faqs", m.faqs, l.faqs);
      same("sources", m.sources.map((s) => [s.label, href(s.url)]), l.sources.map((s) => [s.label, href(s.url)]));
    }
  }
  assert.deepEqual(mismatches.slice(0, 20), [], `${mismatches.length} field mismatches`);
});
