import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import baseline from "../lib/new-attractions/baseline.json";
import { newAttractionData } from "../lib/new-attractions";
import { neighbourhoodEditorialSlugs, neighbourhoodPhotoSlugs, withNeighbourhoodEditorial } from "../lib/neighbourhood-editorial";
import { editorials, hoodPhotos } from "../lib/neighbourhood-editorial/generated";
import type { NeighbourhoodEditorial } from "../lib/neighbourhood-editorial/types";
import { validateEditorial } from "../lib/neighbourhood-editorial/validate";
import type { Topic } from "../lib/types";

const base = baseline as unknown as { sanity: { slug: string }[]; local: { slug: string }[]; supplements: string[]; neighbourhoods: { slug: string }[] };
const hoods = new Set(base.neighbourhoods.map((n) => n.slug));
const places = new Set([...base.sanity, ...base.local].map((x) => x.slug).concat(base.supplements, newAttractionData.map((d) => d.slug)));
const dir = path.join(__dirname, "..", "lib", "neighbourhood-editorial", "data");
const para = (n: number) => Array.from({ length: n }, (_, i) => `word${i % 9}`).join(" ") + ".";
const good: NeighbourhoodEditorial = {
  slug: "ferencvaros",
  checked: "2026-11-10",
  sections: [1, 2, 3].map((i) => ({ title: `Section ${i}`, paragraphs: [para(120)] })),
  placeSlugs: ["chain-bridge"],
  guides: ["budapest-in-3-days"],
  sources: [
    { label: "Official", url: "https://example.org/a" },
    { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/X" },
  ],
  seo: { title: "Ferencváros neighbourhood guide", description: "A guide to Ferencváros with its history, character and the places worth stopping for in the district." },
};
const issues = (e: NeighbourhoodEditorial) => validateEditorial(e, hoods, places).map((x) => x.problem);

test("a complete neighbourhood editorial passes the gate", () => assert.deepEqual(issues(good), []));

test("the gate rejects prices, hours, unknown places, thin text and missing sources", () => {
  assert.ok(issues({ ...good, sections: [{ title: "a", paragraphs: [para(120) + " Entry is 12 EUR."] }, good.sections[1], good.sections[2]] }).some((p) => /price/.test(p)));
  assert.ok(issues({ ...good, sections: [{ title: "a", paragraphs: [para(120) + " It opens at 9:30 daily."] }, good.sections[1], good.sections[2]] }).length > 0);
  assert.ok(issues({ ...good, placeSlugs: ["no-such-place"] }).some((p) => /unknown place/.test(p)));
  assert.ok(issues({ ...good, sections: good.sections.slice(0, 1) }).length > 0);
  assert.ok(issues({ ...good, sources: [good.sources[1], { label: "W2", url: "https://en.wikipedia.org/wiki/Y" }] }).some((p) => /Wikipedia/.test(p)));
  assert.ok(issues({ ...good, slug: "atlantis" }).some((p) => /unknown neighbourhood/.test(p)));
});

test("every shipped neighbourhood editorial passes the gate and the generated index is current", () => {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "photos-hoods.json");
  assert.equal(editorials.length, files.length, "run: node scripts/gen-neighbourhood-editorial.mjs");
  const all = files.map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as NeighbourhoodEditorial);
  for (const e of all) assert.deepEqual(validateEditorial(e, hoods, places), [], e.slug);
  assert.equal(new Set(all.map((e) => e.slug)).size, all.length, "one file per neighbourhood");
  assert.deepEqual(neighbourhoodEditorialSlugs, all.map((e) => e.slug).sort());
});

test("hero overrides are licensed, credited and landscape", () => {
  for (const slug of neighbourhoodPhotoSlugs) {
    const p = hoodPhotos[`hood-${slug}`];
    assert.ok(hoods.has(slug), slug);
    assert.ok(p.alt.length >= 20, `${slug} alt`);
    assert.ok(p.credit?.author && p.credit.licenseUrl && p.credit.sourceUrl, `${slug} credit`);
    assert.match(p.credit?.license ?? "", /^(CC BY(-SA)? [0-9.]+|CC0.*|Public domain)$/i, `${slug} licence`);
    assert.ok((p.width ?? 0) > (p.height ?? 1), `${slug} must be landscape`);
  }
});

test("the layer appends to the Sanity text and never replaces it", () => {
  const e = editorials[0];
  if (!e) return;
  const topic: Topic = {
    slug: e.slug,
    title: "T",
    eyebrow: "",
    summary: "s",
    description: "d",
    intro: "i",
    photo: { src640: "/a-640.webp", src1280: "/a-1280.webp", alt: "alt text for the hero" },
    highlights: ["existing"],
    faqs: [],
    sections: [{ title: "Existing section", body: [] }],
    placesHeading: "p",
    placesIntro: "",
    placeSlugs: ["keep-me"],
    guides: [],
    sources: [{ label: "Old", url: "https://example.org/old" }],
  };
  const [out] = withNeighbourhoodEditorial([topic]);
  assert.equal(out.sections[0].title, "Existing section");
  assert.equal(out.sections.length, 1 + e.sections.length);
  assert.equal(out.placeSlugs[0], "keep-me");
  assert.equal(out.intro, "i");
  assert.ok(out.sources.some((s) => s.url === "https://example.org/old"));
});
