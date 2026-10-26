// Idempotent migration of the local content into Sanity.
//
//   npx tsx scripts/sanity-seed.ts --dry-run   build + validate, no network, no token
//   SANITY_API_TOKEN=... npx tsx scripts/sanity-seed.ts
//   SANITY_SEED_FORCE=1 SANITY_API_TOKEN=... npx tsx scripts/sanity-seed.ts --force
//
// Documents are created with createIfNotExists, so re-running never duplicates
// content and never overwrites edits made in Studio. --force (createOrReplace)
// is destructive for edited documents and needs SANITY_SEED_FORCE=1.
// Only counts are printed; the token is never logged.
import { createHash } from "node:crypto";
import { createReadStream, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../sanity/env";
import {
  attractionPhoto,
  experiences,
  featuredAttractionSlugs,
  featuredGuideSlugs,
  guides,
  legacyPhoto,
  neighbourhoods,
  rawAttractions,
  root,
  suggestedGuides,
  type LocalPhoto,
  type LocalTopic,
} from "./lib/local-content";

type Doc = { _id: string; _type: string; [field: string]: unknown };
type Patch = { id: string; fields: Record<string, unknown> };

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const token = process.env.SANITY_API_TOKEN?.trim();

// ---------------------------------------------------------------- helpers

const sha = (s: string) => createHash("sha1").update(s).digest("hex");
const key = (seed: string) => sha(seed).slice(0, 12);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const slugValue = (slug: string) => ({ _type: "slug", current: slug });
const ref = (id: string) => ({ _type: "reference", _ref: id });
const refItem = (id: string, seed: string) => ({
  _type: "reference",
  _ref: id,
  _key: key(`${seed}:${id}`),
});
const compact = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(
    Object.entries(o).filter(
      ([, v]) =>
        v !== undefined &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0),
    ),
  ) as T;

function blocks(seed: string, paragraphs: string[], bullets: string[] = []) {
  const block = (text: string, index: number, list?: "bullet") => ({
    _type: "block",
    _key: key(`${seed}:b${index}`),
    style: "normal",
    markDefs: [],
    ...(list ? { listItem: list, level: 1 } : {}),
    children: [
      { _type: "span", _key: key(`${seed}:s${index}`), text, marks: [] },
    ],
  });
  return [
    ...paragraphs.map((p, i) => block(p, i)),
    ...bullets.map((b, i) => block(b, paragraphs.length + i, "bullet")),
  ];
}

const sourceItems = (seed: string, sources: { label: string; url: string }[]) =>
  sources.map((s, i) => ({
    _type: "sourceLink",
    _key: key(`${seed}:src${i}`),
    label: s.label,
    url: s.url,
  }));
const faqItems = (seed: string, faqs: { question: string; answer: string }[]) =>
  faqs.map((f, i) => ({
    _type: "faq",
    _key: key(`${seed}:faq${i}`),
    question: f.question,
    answer: f.answer,
  }));

// ---------------------------------------------------------------- images

const photoFiles = new Set<string>();
function trackPhoto(photo: LocalPhoto | undefined) {
  if (photo) photoFiles.add(photo.src);
}

// creativecommons.org serves the same pages over https; upgrade those links.
const toHttps = (url?: string) =>
  url?.replace(
    /^http:\/\/creativecommons\.org\//,
    "https://creativecommons.org/",
  );

const assetIds = new Map<string, string>();
const fileOf = (src: string) => path.join(root, "public", src);

function photoValue(photo: LocalPhoto | undefined) {
  if (!photo) return undefined;
  const assetId =
    assetIds.get(photo.src) ?? `image-pending-${sha(photo.src).slice(0, 8)}`;
  const c = photo.credit;
  return compact({
    _type: "photo",
    asset: ref(assetId),
    alt: photo.alt,
    creditTitle: c?.title,
    creditAuthor: c?.author,
    creditLicense: c?.license,
    creditLicenseUrl: toHttps(c?.licenseUrl),
    creditSourceUrl: toHttps(c?.sourceUrl),
  });
}

async function uploadImages(client: SanityClient | null) {
  const files = [...photoFiles].sort();
  for (const src of files) {
    if (!existsSync(fileOf(src))) throw new Error(`Missing image file ${src}`);
  }
  if (!client) {
    for (const src of files)
      assetIds.set(src, `image-dryrun-${sha(src).slice(0, 8)}-1x1-webp`);
    return;
  }
  const queue = [...files];
  const worker = async () => {
    for (let src = queue.shift(); src; src = queue.shift()) {
      let lastError: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const asset = await client.assets.upload(
            "image",
            createReadStream(fileOf(src)),
            { filename: path.basename(src) },
          );
          assetIds.set(src, asset._id);
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (lastError) throw lastError;
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
}

// ---------------------------------------------------------------- build

const categoryId = (kind: "attraction" | "guide", title: string) =>
  `category.${kind}-${slugify(title)}`;
const guideIds = new Set(guides.map((g) => g.slug));

function buildDocuments() {
  const categories: Doc[] = [];
  const addCategory = (kind: "attraction" | "guide", title: string) => {
    const _id = categoryId(kind, title);
    if (categories.some((c) => c._id === _id)) return;
    categories.push({
      _id,
      _type: "category",
      title,
      slug: slugValue(`${kind}-${slugify(title)}`),
      kind,
    });
  };
  for (const a of rawAttractions) addCategory("attraction", a.category);
  for (const g of guides) addCategory("guide", g.category);

  const regions: Doc[] = [
    {
      _id: "region.buda",
      _type: "region",
      title: "Buda",
      slug: slugValue("buda"),
      description:
        "The hilly western bank of the Danube, home to the Castle District and Gellért Hill.",
    },
    {
      _id: "region.pest",
      _type: "region",
      title: "Pest",
      slug: slugValue("pest"),
      description:
        "The flat eastern bank of the Danube, with the city centre, Parliament and City Park.",
    },
  ];

  const experiencesFor = (slug: string) =>
    experiences.filter((e) => e.placeSlugs.includes(slug)).map((e) => e.slug);

  // Photos must be tracked before upload; build once to collect, then again
  // with real asset ids.
  const guideDocs: Doc[] = guides.map((g, index) => ({
    _id: `guide.${g.slug}`,
    _type: "guide",
    title: g.title,
    shortTitle: g.shortTitle,
    slug: slugValue(g.slug),
    category: ref(categoryId("guide", g.category)),
    description: g.description,
    heroImage: photoValue(g.photo),
    intro: g.intro,
    highlights: g.highlights,
    sections: g.sections.map((s) => ({
      _type: "guideSection",
      _key: key(`guide.${g.slug}:section:${s.id}`),
      id: s.id,
      title: s.title,
      body: blocks(`guide.${g.slug}:${s.id}`, s.paragraphs, s.bullets),
    })),
    faqs: faqItems(`guide.${g.slug}`, g.faqs),
    sources: sourceItems(`guide.${g.slug}`, g.sources),
    updated: g.updated,
    order: index,
    seo: { _type: "seo", description: g.description },
  }));

  const attractionDocs: Doc[] = rawAttractions.map((a, index) =>
    compact({
      _id: `attraction.${a.slug}`,
      _type: "attraction",
      name: a.name,
      slug: slugValue(a.slug),
      category: ref(categoryId("attraction", a.category)),
      description: a.description,
      heroImage: photoValue(attractionPhoto(a)),
      address: a.address,
      location: a.coordinates
        ? {
            _type: "geopoint",
            lat: a.coordinates.latitude,
            lng: a.coordinates.longitude,
          }
        : undefined,
      operatingStatus: a.status,
      notice: a.notice,
      sourceUrl: a.sourceUrl,
      sourceLabel: a.sourceLabel,
      additionalSource: a.additionalSource,
      checked: a.checked,
      order: index,
      featured: featuredAttractionSlugs.includes(a.slug),
      relatedGuides: suggestedGuides(a.category)
        .filter((g) => guideIds.has(g))
        .map((g) => refItem(`guide.${g}`, `attraction.${a.slug}:guides`)),
    }),
  );

  const topicDoc = (
    type: "experience" | "neighbourhood",
    t: LocalTopic,
    index: number,
    region?: string,
  ): Doc =>
    compact({
      _id: `${type}.${t.slug}`,
      _type: type,
      title: t.title,
      slug: slugValue(t.slug),
      eyebrow: t.eyebrow,
      summary: t.summary,
      heroImage: photoValue(t.photo),
      intro: t.intro,
      highlights: t.highlights,
      sections: t.sections.map((s, i) => ({
        _type: "topicSection",
        _key: key(`${type}.${t.slug}:section${i}`),
        title: s.title,
        body: blocks(`${type}.${t.slug}:${i}`, s.paragraphs, s.bullets),
      })),
      faqs: faqItems(`${type}.${t.slug}`, t.faqs),
      placesHeading: t.placesHeading,
      placesIntro: t.placesIntro,
      places: t.placeSlugs.map((s) =>
        refItem(`attraction.${s}`, `${type}.${t.slug}:places`),
      ),
      guides: t.guides.map((g) =>
        refItem(`guide.${g}`, `${type}.${t.slug}:guides`),
      ),
      region: region ? ref(`region.${region}`) : undefined,
      sources: sourceItems(`${type}.${t.slug}`, t.sources),
      order: index,
      seo: { _type: "seo", description: t.description },
    }) as Doc;

  const experienceDocs = experiences.map((t, i) => topicDoc("experience", t, i));
  const regionOf: Record<string, string> = {
    "castle-district": "buda",
    "downtown-pest": "pest",
  };
  const neighbourhoodDocs = neighbourhoods.map((t, i) =>
    topicDoc("neighbourhood", t, i, regionOf[t.slug]),
  );

  const settings: Doc = {
    _id: "siteSettings",
    _type: "siteSettings",
    title: "GoToBudapest",
    tagline: "A city worth getting lost in.",
    description:
      "Discover Budapest’s riverside landmarks, thermal baths and neighbourhoods. Explore 100 places, experiences and travel guides for your own city break.",
    defaultShareImage: photoValue(
      legacyPhoto(
        "danube.webp",
        "The Hungarian Parliament and the Danube seen from the Buda riverbank",
      ),
    ),
    featuredAttractions: featuredAttractionSlugs.map((s) =>
      refItem(`attraction.${s}`, "siteSettings:attractions"),
    ),
    featuredGuides: featuredGuideSlugs.map((s) =>
      refItem(`guide.${s}`, "siteSettings:guides"),
    ),
  };

  // Phase 1 order matters: referenced documents first.
  const phase1: Doc[] = [
    ...categories,
    ...regions,
    ...guideDocs,
    ...attractionDocs,
    ...experienceDocs,
    ...neighbourhoodDocs,
    settings,
  ];

  // Phase 2: cross links that would be circular in phase 1.
  const patches: Patch[] = [
    ...guides.map((g) => ({
      id: `guide.${g.slug}`,
      fields: {
        relatedGuides: g.related
          .filter((r) => guideIds.has(r))
          .map((r) => refItem(`guide.${r}`, `guide.${g.slug}:related`)),
      },
    })),
    ...rawAttractions
      .map((a) => ({
        id: `attraction.${a.slug}`,
        fields: {
          relatedExperiences: experiencesFor(a.slug).map((e) =>
            refItem(`experience.${e}`, `attraction.${a.slug}:experiences`),
          ),
        },
      }))
      .filter((p) => (p.fields.relatedExperiences as unknown[]).length > 0),
  ];
  return { phase1, patches };
}

// ---------------------------------------------------------------- validate

const required: Record<string, string[]> = {
  attraction: ["name", "slug", "category", "description", "sourceUrl"],
  guide: [
    "title",
    "shortTitle",
    "slug",
    "category",
    "description",
    "intro",
    "sections",
    "updated",
  ],
  experience: ["title", "slug", "summary", "intro", "sections"],
  neighbourhood: ["title", "slug", "summary", "intro", "sections"],
  category: ["title", "slug", "kind"],
  region: ["title", "slug"],
  siteSettings: ["title", "description"],
};
const urlFields = new Set([
  "sourceUrl",
  "additionalSource",
  "url",
  "creditLicenseUrl",
  "creditSourceUrl",
]);

async function validate(phase1: Doc[], patches: Patch[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const d of phase1) {
    if (ids.has(d._id)) errors.push(`duplicate id ${d._id}`);
    ids.add(d._id);
  }

  // Field names must exist in the Studio schema.
  const { schemaTypes } = await import("../sanity/schemaTypes");
  const fieldsOf = new Map<string, Set<string>>();
  for (const t of schemaTypes) {
    const fields = (t as { fields?: { name: string }[] }).fields;
    if (fields) fieldsOf.set(t.name, new Set(fields.map((f) => f.name)));
  }

  const walk = (node: unknown, where: string) => {
    if (Array.isArray(node)) {
      node.forEach((n, i) => walk(n, `${where}[${i}]`));
      return;
    }
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (typeof o._ref === "string") {
      if (!ids.has(o._ref) && !o._ref.startsWith("image-"))
        errors.push(`${where}: dangling reference ${o._ref}`);
    }
    if (o._type === "photo" && o.asset) {
      const alt = typeof o.alt === "string" ? o.alt : "";
      if (alt.length < 15 || alt.length > 200)
        errors.push(`${where}: alt text must be 15–200 characters`);
    }
    if (o._type === "guideSection" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(o.id)))
      errors.push(`${where}: bad section id ${String(o.id)}`);
    for (const [k, v] of Object.entries(o)) {
      if (urlFields.has(k) && typeof v === "string" && !/^https:\/\//.test(v))
        errors.push(`${where}.${k}: not an https URL`);
      walk(v, `${where}.${k}`);
    }
  };

  for (const d of phase1) {
    for (const f of required[d._type] ?? []) {
      const v = d[f];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0))
        errors.push(`${d._id}: missing required field ${f}`);
    }
    const allowed = fieldsOf.get(d._type);
    if (!allowed) errors.push(`${d._id}: unknown type ${d._type}`);
    else
      for (const k of Object.keys(d))
        if (!k.startsWith("_") && !allowed.has(k))
          errors.push(`${d._id}: field "${k}" is not in the ${d._type} schema`);
    if (d._type === "attraction" && String(d.description).length > 400)
      errors.push(`${d._id}: description over 400 characters`);
    if (d._type === "slug") continue;
    const slug = (d.slug as { current?: string } | undefined)?.current;
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      errors.push(`${d._id}: bad slug ${slug}`);
    if (slug && d._type !== "category" && d._id !== `${d._type}.${slug}`)
      errors.push(`${d._id}: id does not match slug ${slug}`);
    walk(d, d._id);
  }
  for (const p of patches) {
    if (!ids.has(p.id)) errors.push(`patch target ${p.id} does not exist`);
    walk(p.fields, `patch ${p.id}`);
  }
  const attractionCount = phase1.filter((d) => d._type === "attraction").length;
  if (attractionCount !== 100)
    errors.push(`expected 100 attractions, built ${attractionCount}`);
  return errors;
}

// ---------------------------------------------------------------- write

const redact = (err: unknown) => {
  let msg = err instanceof Error ? err.message : String(err);
  if (token) msg = msg.split(token).join("[redacted]");
  return msg.slice(0, 300);
};

async function countByType(client: SanityClient) {
  return client.fetch<Record<string, number>>(
    `{ ${[
      "attraction",
      "guide",
      "experience",
      "neighbourhood",
      "region",
      "category",
      "siteSettings",
    ]
      .map((t) => `"${t}": count(*[_type == "${t}" && !(_id in path("drafts.**"))])`)
      .join(", ")} }`,
  );
}

const chunk = <T>(items: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
};

async function write(client: SanityClient, phase1: Doc[], patches: Patch[]) {
  const existing = new Set<string>();
  for (const ids of chunk(phase1.map((d) => d._id), 200)) {
    const found = await client.fetch<string[]>("*[_id in $ids]._id", { ids });
    found.forEach((id) => existing.add(id));
  }
  for (const docs of chunk(phase1, 50)) {
    const tx = client.transaction();
    for (const d of docs)
      force ? tx.createOrReplace(d) : tx.createIfNotExists(d);
    await tx.commit({ visibility: "sync" });
  }
  // Phase 2: cross links. setIfMissing never overwrites an editor's changes.
  for (const batch of chunk(patches, 50)) {
    const tx = client.transaction();
    for (const p of batch)
      tx.patch(p.id, (patch) =>
        force ? patch.set(p.fields) : patch.setIfMissing(p.fields),
      );
    await tx.commit({ visibility: "sync" });
  }
  return {
    created: phase1.filter((d) => !existing.has(d._id)).length,
    skipped: phase1.filter((d) => existing.has(d._id)).length,
  };
}

function table(title: string, counts: Record<string, number>) {
  console.log(`\n${title}`);
  for (const [type, n] of Object.entries(counts))
    console.log(`  ${type.padEnd(14)} ${String(n).padStart(4)}`);
}

async function main() {
  if (force && process.env.SANITY_SEED_FORCE !== "1" && !dryRun) {
    console.error(
      "--force replaces documents and discards edits made in Studio. Set SANITY_SEED_FORCE=1 to confirm.",
    );
    process.exit(2);
  }
  if (!dryRun && !token) {
    console.error("SANITY_API_TOKEN is not set (use --dry-run to validate without it).");
    process.exit(2);
  }

  // First pass only to discover which image files are used.
  buildDocumentsForPhotos();
  const client = dryRun
    ? null
    : createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  await uploadImages(client);
  const { phase1, patches } = buildDocuments();

  const errors = await validate(phase1, patches);
  const built: Record<string, number> = {};
  for (const d of phase1) built[d._type] = (built[d._type] ?? 0) + 1;
  table("Documents built", built);
  console.log(`  images         ${String(photoFiles.size).padStart(4)} (distinct files)`);
  console.log(`  cross-link patches ${patches.length}`);
  if (errors.length) {
    console.error(`\n${errors.length} validation error(s):`);
    for (const e of errors.slice(0, 40)) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("\nValidation passed: unique ids, schema fields, references, https URLs, alt text.");
  // Test hook: lets tests/sanity-pipeline.test.ts evaluate the website GROQ queries
  // against exactly the documents this script would create.
  if (process.env.SANITY_SEED_DUMP && dryRun)
    writeFileSync(process.env.SANITY_SEED_DUMP, JSON.stringify({ docs: phase1, patches }));
  if (dryRun || !client) {
    console.log("Dry run: nothing was written.");
    return;
  }

  table("Before", await countByType(client));
  const result = await write(client, phase1, patches);
  console.log(`\nCreated ${result.created}, already present ${result.skipped}.`);
  table("After", await countByType(client));
}

// Photo tracking pass: builds documents with placeholder asset ids so every
// referenced file is known before uploading.
function buildDocumentsForPhotos() {
  for (const a of rawAttractions) trackPhoto(attractionPhoto(a));
  for (const g of guides) trackPhoto(g.photo);
  for (const t of [...experiences, ...neighbourhoods]) trackPhoto(t.photo);
  trackPhoto(legacyPhoto("danube.webp", "x"));
}

main().catch((error) => {
  console.error(`Seed failed: ${redact(error)}`);
  const status = (error as { statusCode?: number }).statusCode;
  if (status === 401 || status === 403)
    console.error("The token was rejected or lacks write permission (Editor role needed).");
  process.exit(1);
});
