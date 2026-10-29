// Read-only audit of the local editorial content that scripts/sanity-seed.ts loads into Sanity:
// missing descriptions, histories, photography, galleries, credits and broken image files.
// It writes nothing and needs no credentials.
// Remote image URLs (the Sanity CDN assets already in the dataset) are checked with a HEAD request.
// Run: NODE_OPTIONS=--use-system-ca npx tsx scripts/audit-content.ts [--list]
import { existsSync } from "node:fs";
import path from "node:path";
import { localContent } from "../lib/local-content";
import type { Photo } from "../lib/types";

const root = process.cwd(); // run from the repository root
const content = localContent();
type Problem = { kind: string; where: string };
const problems: Problem[] = [];
const add = (kind: string, where: string) => problems.push({ kind, where });
const files = new Set<string>();
const remote = new Set<string>();

function checkPhoto(where: string, p: Photo | undefined, opts: { needCredit: boolean }) {
  if (!p) return void add("no photo", where);
  for (const f of [p.src640, p.src1280]) {
    files.add(f);
    if (f.startsWith("https://")) remote.add(f);
    else if (!existsSync(path.join(root, "public", f))) add("missing local image file", `${where}: ${f}`);
  }
  if (!p.alt || p.alt.length < 15) add("weak alt text", where);
  if (opts.needCredit && !p.credit) add("photo without a credit", where);
  if (p.credit && !(p.credit.author && p.credit.license && p.credit.licenseUrl && p.credit.sourceUrl)) add("incomplete credit", where);
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const ptWords = (blocks: { children?: { text?: string }[] }[] | undefined) =>
  (blocks ?? []).reduce((n, b) => n + words((b.children ?? []).map((c) => c.text ?? "").join(" ")), 0);

const a = content.attractions;
const stat = {
  attractions: a.length,
  withDescription: a.filter((x) => x.description && words(x.description) >= 15).length,
  withHistory: a.filter((x) => x.history).length,
  withHeroPhoto: a.filter((x) => x.photo).length,
  withCreditedHero: a.filter((x) => x.photo?.credit).length,
  withGallery: a.filter((x) => (x.gallery?.length ?? 0) > 0).length,
  galleryImages: a.reduce((n, x) => n + (x.gallery?.length ?? 0), 0),
};
for (const x of a) {
  if (!x.description || words(x.description) < 15) add("one-line description (under 15 words)", `attraction ${x.slug}`);
  if (!(x.body?.length)) add("no long-form body", `attraction ${x.slug}`);
  if (!x.history) add("no history", `attraction ${x.slug}`);
  checkPhoto(`attraction ${x.slug} hero`, x.photo, { needCredit: false });
  if (x.photo && !x.photo.credit) add("hero is shared design artwork without a credit", `attraction ${x.slug}`);
  (x.gallery ?? []).forEach((g, i) => checkPhoto(`attraction ${x.slug} gallery ${i + 1}`, g, { needCredit: true }));
}

const g = content.guides;
const guideStat = g.map((x) => ({
  slug: x.slug,
  sections: x.sections.length,
  words: x.sections.reduce((n, s) => n + ptWords(s.body as never), 0) + words(x.intro),
  faqs: x.faqs.length,
}));
for (const x of g) {
  checkPhoto(`guide ${x.slug} hero`, x.photo, { needCredit: false });
  if (x.sections.length < 3) add("guide with fewer than 3 sections", `guide ${x.slug}`);
}

async function main() {
  // Remote assets: one HEAD request each.
  let remoteBad = 0;
  for (const url of remote) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      if (!r.ok) {
        remoteBad++;
        add("remote image does not answer 200", `${url} -> ${r.status}`);
      }
    } catch {
      remoteBad++;
      add("remote image unreachable", url);
    }
  }

  console.log(
    JSON.stringify(
      { attractionStats: stat, guides: guideStat, experiences: content.experiences?.length, neighbourhoods: content.neighbourhoods?.length, distinctImageFiles: files.size, remoteImages: remote.size, remoteImagesNotOk: remoteBad },
      null,
      2,
    ),
  );
  const byKind = new Map<string, number>();
  for (const p of problems) byKind.set(p.kind, (byKind.get(p.kind) ?? 0) + 1);
  console.log("\nProblem counts:");
  for (const [k, n] of [...byKind].sort((x, y) => y[1] - x[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
  if (process.argv.includes("--list")) console.log("\n" + problems.map((p) => `${p.kind}: ${p.where}`).join("\n"));
}
void main();
