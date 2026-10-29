import assert from "node:assert/strict";
import test from "node:test";
import attractionData from "../lib/attractions.json";
import { attractionLongForm, longFormBody } from "../lib/attraction-long-form";
import { guideExtraSections } from "../lib/guide-extra-sections";
import { guideInlinePhotos } from "../lib/inline-photos";
import { guides } from "../lib/guides";
import { localContent } from "../lib/local-content";
import { getAttractionEditorial } from "../lib/attraction-editorial";
import { historySeedsC } from "../lib/attraction-history-batch-c";
import photos from "../lib/photos.json";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const slugs = new Set(attractionData.map((a) => a.slug));

// The long-form text is editorial writing grounded in cited sources. These checks cannot prove a fact true;
// they keep out the things that must never appear in it: unsourced changeable details, thin text, and
// broken structure.
test("long-form attraction text: real attractions, enough substance, sourced and dated", () => {
  const entries = Object.entries(attractionLongForm);
  assert.equal(entries.length, 12);
  for (const [slug, lf] of entries) {
    assert.ok(slugs.has(slug), `unknown attraction ${slug}`);
    const body = lf.paragraphs.reduce((n, p) => n + words(p), 0);
    assert.ok(body >= 190 && body <= 700, `${slug}: body has ${body} words`);
    assert.ok(words(lf.description) >= 25 && words(lf.description) <= 45, `${slug}: description length`);
    assert.ok(lf.paragraphs.length >= 4, `${slug}: at least four paragraphs`);
    assert.ok(lf.tips.length >= 3, `${slug}: practical tips`);
    assert.ok(lf.sources.length >= 2 && lf.sources.every((s) => s.url.startsWith("https://") && s.label.length > 5), `${slug}: sources`);
    assert.match(lf.checked, /^2026-\d{2}-\d{2}$/);
    // Opening hours, prices and booking conditions change: never stated in this text.
    const text = [lf.description, ...lf.paragraphs, ...lf.tips].join(" ");
    assert.doesNotMatch(text, /[€$£]|\bHUF\b|\bFt\b|\b\d{1,2}:\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\bfree entry\b|\bdiscount/i, `${slug}: price or opening time stated`);
  }
});

test("long-form body is valid Portable Text with unique keys and linked sources", () => {
  for (const slug of Object.keys(attractionLongForm)) {
    const body = longFormBody(slug)!;
    const keys = body.map((b) => b._key);
    assert.equal(new Set(keys).size, keys.length, `${slug}: duplicate keys`);
    assert.ok(body.every((b) => b._type === "block" && b.children.length > 0 && b.children.every((c) => c.text.length > 0)));
    const links = body.flatMap((b) => b.markDefs ?? []).filter((m) => m._type === "link");
    assert.equal(links.length, attractionLongForm[slug].sources.length);
    assert.ok(links.every((l) => l.href?.startsWith("https://")));
    assert.equal(body.filter((b) => b.style === "h3").length, 2, "Good to know + Sources");
    assert.deepEqual(longFormBody(slug), body, "deterministic: seeding stays idempotent");
  }
  assert.equal(longFormBody("not-an-attraction"), undefined);
});

test("the attraction pages use the long-form text; other attractions are unchanged", () => {
  const a = localContent().attractions;
  const withBody = a.filter((x) => (x.body?.length ?? 0) > 0);
  assert.deepEqual(withBody.map((x) => x.slug).sort(), Object.keys(attractionLongForm).sort());
  for (const x of withBody) assert.equal(x.description, attractionLongForm[x.slug].description);
  const plain = a.find((x) => !attractionLongForm[x.slug])!;
  assert.equal(plain.description, (attractionData.find((d) => d.slug === plain.slug) as { description: string }).description);
});

test("batch C histories: new places only, at least two chapters and a cited source each", () => {
  assert.equal(historySeedsC.length, 7);
  const baseline = new Set(
    attractionData.map((x) => x.slug).filter((s) => getAttractionEditorial(s) && !historySeedsC.some((c) => c.slug === s)),
  );
  for (const seed of historySeedsC) {
    assert.ok(slugs.has(seed.slug));
    assert.ok(!baseline.has(seed.slug), `${seed.slug} already had a history`);
    assert.ok(seed.chapters.length >= 2);
    for (const [heading, narrative] of seed.chapters) assert.ok(heading.length > 8 && words(narrative) >= 40, `${seed.slug}: ${heading}`);
    assert.ok((seed.additionalSources ?? []).every((s) => s.url.startsWith("https://")) && (seed.additionalSources ?? []).length >= 1);
    const history = getAttractionEditorial(seed.slug)!;
    assert.ok(history.sources.length >= 2, "visitor source plus the cited article");
    assert.doesNotMatch([seed.introduction, ...seed.chapters.map((c) => c[1])].join(" "), /[€$£]|\bHUF\b/, seed.slug);
  }
});

test("extra guide sections: unique ids, anchored photos and more text in every expanded guide", () => {
  for (const [slug, extra] of Object.entries(guideExtraSections)) {
    const guide = guides.find((g) => g.slug === slug)!;
    assert.ok(guide, slug);
    const ids = guide.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${slug}: duplicate section id`);
    for (const s of extra) {
      assert.ok(ids.includes(s.id));
      assert.ok(s.paragraphs.reduce((n, p) => n + words(p), 0) >= 90, `${s.id}: substantial`);
      assert.doesNotMatch([...s.paragraphs, ...(s.bullets ?? [])].join(" "), /[€$£]|\bHUF\b/, s.id);
      const placed = (guideInlinePhotos[slug] ?? []).filter((p) => p.after === s.id);
      assert.equal(placed.length, 1, `${s.id}: one inline photo`);
      assert.ok((photos as Record<string, { credit?: { author?: string; license?: string; sourceUrl?: string } }>)[placed[0].photoKey]?.credit?.author);
    }
  }
  assert.equal(Object.keys(guideExtraSections).length, 5);
});
