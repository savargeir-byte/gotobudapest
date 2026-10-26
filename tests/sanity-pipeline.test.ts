import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { evaluate, parse } from "groq-js";
import {
  attractionsQuery,
  experiencesQuery,
  guidesQuery,
  neighbourhoodsQuery,
  settingsQuery,
} from "../lib/sanity/queries";
import {
  mapAttraction,
  mapGuide,
  mapSettings,
  mapTopic,
} from "../lib/sanity/mappers";
import { localContent } from "../lib/local-content";

// End to end without network or token: build the exact documents the seed script
// would create, evaluate the website's GROQ queries over them with groq-js, run the
// mappers, and compare the result with the local content the site falls back to.

type Doc = { _id: string; _type: string; [k: string]: unknown };
const dir = mkdtempSync(join(tmpdir(), "gtb-seed-"));
const dump = join(dir, "docs.json");
execFileSync(process.execPath, ["--import", "tsx", "scripts/sanity-seed.ts", "--dry-run"], {
  env: { ...process.env, SANITY_SEED_DUMP: dump },
  stdio: "pipe",
});
const { docs, patches } = JSON.parse(readFileSync(dump, "utf8")) as {
  docs: Doc[];
  patches: { id: string; fields: Record<string, unknown> }[];
};
// Dry-run asset ids are placeholders; give them the real id shape.
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

async function run<T>(query: string): Promise<T> {
  const result = await evaluate(parse(query), { dataset });
  return (await result.get()) as T;
}

const local = localContent();

test("the seed produces the expected document counts", () => {
  const count = (t: string) => dataset.filter((d) => d._type === t).length;
  assert.equal(count("attraction"), 100);
  assert.equal(count("guide"), 8);
  assert.equal(count("experience"), 3);
  assert.equal(count("neighbourhood"), 2);
  assert.equal(count("region"), 2);
  assert.equal(count("siteSettings"), 1);
  assert.equal(new Set(dataset.map((d) => d._id)).size, dataset.length, "duplicate ids");
});

test("attractions round-trip: slugs, sources, order, photos and coordinates survive", async () => {
  const raw = await run<never[]>(attractionsQuery);
  const mapped = raw.map(mapAttraction).filter((a) => a !== undefined);
  assert.equal(mapped.length, 100);
  assert.deepEqual(mapped.map((a) => a.slug), local.attractions.map((a) => a.slug), "editorial order");
  for (const l of local.attractions) {
    const m = mapped.find((a) => a.slug === l.slug)!;
    assert.equal(m.name, l.name);
    assert.equal(m.description, l.description);
    assert.equal(m.sourceUrl.replace(/\/$/, ""), l.sourceUrl.replace(/\/$/, ""), l.slug);
    assert.equal(m.category, l.category);
    assert.equal(m.status, l.status);
    assert.deepEqual(m.coordinates, l.coordinates, `${l.slug} coordinates`);
    assert.equal(Boolean(m.photo), Boolean(l.photo), `${l.slug} photo presence`);
    if (m.photo) assert.ok(m.photo.src640.startsWith("https://cdn.sanity.io/images/ut6qxuke/production/"));
  }
  assert.equal(mapped.filter((a) => a.featured).length, 6);
});

test("guides round-trip: sections, faqs, sources, related guides and photos", async () => {
  const raw = await run<never[]>(guidesQuery);
  const mapped = raw.map((g) => mapGuide(g, local.guides[0].photo)).filter((g) => g !== undefined);
  assert.deepEqual(mapped.map((g) => g.slug).sort(), local.guides.map((g) => g.slug).sort());
  for (const l of local.guides) {
    const m = mapped.find((g) => g.slug === l.slug)!;
    assert.deepEqual(m.sections.map((s) => s.id), l.sections.map((s) => s.id), `${l.slug} section ids`);
    assert.equal(m.faqs.length, l.faqs.length);
    assert.equal(m.sources.length, l.sources.length, `${l.slug} sources`);
    assert.deepEqual([...m.related].sort(), [...l.related].sort(), `${l.slug} related`);
    assert.ok(m.sections.every((s) => s.body.length > 0), `${l.slug} empty section body`);
    assert.ok(m.photo.src1280.startsWith("https://cdn.sanity.io/"), `${l.slug} photo`);
  }
});

test("experiences and neighbourhoods round-trip with ordered places and guides", async () => {
  for (const [query, localList] of [
    [experiencesQuery, local.experiences],
    [neighbourhoodsQuery, local.neighbourhoods],
  ] as const) {
    const raw = await run<never[]>(query);
    const mapped = raw.map((t) => mapTopic(t, local.experiences[0].photo)).filter((t) => t !== undefined);
    assert.equal(mapped.length, localList.length);
    for (const l of localList) {
      const m = mapped.find((t) => t.slug === l.slug)!;
      assert.deepEqual(m.placeSlugs, l.placeSlugs, `${l.slug} places and order`);
      assert.deepEqual(m.guides, l.guides, `${l.slug} guides`);
      assert.equal(m.sections.length, l.sections.length);
      assert.equal(m.faqs.length, l.faqs.length);
      assert.deepEqual(m.highlights, l.highlights);
    }
  }
});

test("site settings resolve featured references", async () => {
  const s = mapSettings(await run(settingsQuery), { featuredAttractions: [], featuredGuides: [] });
  assert.deepEqual(s.featuredAttractions, local.settings.featuredAttractions);
  assert.deepEqual(s.featuredGuides, local.settings.featuredGuides);
});

test("every cross reference points at an existing document", () => {
  const ids = new Set(dataset.map((d) => d._id));
  const dangling: string[] = [];
  const walk = (v: unknown, owner: string) => {
    if (Array.isArray(v)) v.forEach((x) => walk(x, owner));
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o._ref === "string" && o._type === "reference" && !o._ref.startsWith("image-") && !ids.has(o._ref)) dangling.push(`${owner} -> ${o._ref}`);
      Object.values(o).forEach((x) => walk(x, owner));
    }
  };
  dataset.forEach((d) => walk(d, d._id));
  assert.deepEqual(dangling, []);
});
