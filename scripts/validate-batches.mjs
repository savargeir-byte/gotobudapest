// Validates the researched content batches in lib/content-batches/:
//   <n>-long-form.json  { "<slug>": { description, paragraphs, tips, sources, checked } }
//   <n>-history.json    [ { slug, introduction, chapters: [[heading, narrative]], stories?, additionalSources } ]
// These checks cannot prove a fact true. They keep out what must never appear (prices, opening times,
// thin text, missing sources, broken structure) so every batch meets the same minimum.
// Run: node scripts/validate-batches.mjs [file ...]   (no argument: every file in lib/content-batches)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const dir = new URL("lib/content-batches/", root);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const places = new Map([
  ...read("lib/attractions.json").map((a) => [a.slug, a]),
  // Staging file for attractions not yet merged into attractions.json (absent once merged).
  ...(existsSync(new URL("lib/content-batches/new-attractions.json", root)) ? read("lib/content-batches/new-attractions.json") : []).map((a) => [a.slug, a]),
]);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const VOLATILE = /[€$£]|\bHUF\b|\bFt\b|\bEUR\b|\b\d{1,2}:\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\bfree (entry|admission)\b|\bdiscount|\bticket(s)? (cost|costs|price)|\bopen(s|ing)? (daily|every|from|at|on)\b|\bclosed on (mon|tue|wed|thu|fri|sat|sun)/i;
const MARKUP = /\*\*|^#{1,6}\s|<[a-z]+[^>]*>|\[[^\]]+\]\(https?:/im;
const isHttps = (u) => typeof u === "string" && /^https:\/\/[^\s]+$/.test(u);
const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);

const argFiles = process.argv.slice(2);
const files = (argFiles.length ? argFiles : readdirSync(dir).map((f) => path.join("lib/content-batches", f)))
  .map((f) => f.replace(/\\/g, "/"))
  .filter((f) => /(-(long-form|history)|\/guide-[a-z0-9-]+)\.json$/.test(f));

const photoKeys = read("lib/photos.json");
const GUIDES = ["getting-around-budapest", "budapest-bars-nightlife", "budapest-food-and-markets"];
let guideCount = 0;
const seenLong = new Map();
const seenHist = new Map();
let longCount = 0;
let histCount = 0;
let stories = 0;

for (const f of files) {
  const data = read(f);
  if (/\/guide-[a-z0-9-]+\.json$/.test(f)) {
    // guide-<slug>.json: { sections: [{id,title,paragraphs,bullets?}], faqs, sources, places, photos }
    const slug = path.basename(f, ".json").replace(/^guide-/, "");
    const w = f;
    guideCount++;
    if (!GUIDES.includes(slug)) bad(w, "unknown guide");
    const secs = data.sections ?? [];
    if (secs.length < 3) bad(w, "at least 3 new sections");
    const ids = new Set();
    let total = 0;
    for (const sec of secs) {
      if (!/^[a-z0-9-]+$/.test(sec.id ?? "") || ids.has(sec.id)) bad(w, `section id ${sec.id}`);
      ids.add(sec.id);
      if ((sec.title ?? "").length < 8) bad(w, `section title ${sec.id}`);
      const ps = sec.paragraphs ?? [];
      const n = ps.reduce((a, p) => a + words(p), 0);
      total += n;
      if (ps.length < 2 || n < 110) bad(w, `section ${sec.id}: at least 2 paragraphs and 110 words (has ${n})`);
      if ((sec.bullets ?? []).some((b) => words(b) < 4 || words(b) > 40)) bad(w, `section ${sec.id}: bullet length`);
    }
    if (total < 500 || total > 1400) bad(w, `new section text has ${total} words (500-1400)`);
    const text = [...secs.flatMap((x) => [...x.paragraphs, ...(x.bullets ?? [])]), ...(data.faqs ?? []).flatMap((q) => [q.question, q.answer])].join("\n");
    if (VOLATILE.test(text)) bad(w, `price/opening-time wording: ${text.match(VOLATILE)[0]}`);
    if (MARKUP.test(text)) bad(w, "markup in text");
    if ((data.faqs ?? []).length < 2 || (data.faqs ?? []).some((q) => words(q.answer ?? "") < 15)) bad(w, "at least 2 FAQs with real answers");
    const srcs = data.sources ?? [];
    if (srcs.length < 2 || !srcs.every((x) => isHttps(x.url) && (x.label ?? "").length > 5)) bad(w, "at least 2 sources with https url");
    if ((data.places ?? []).length < 4 || !data.places.every((p) => places.has(p))) bad(w, "places: at least 4 existing attraction slugs");
    for (const ph of data.photos ?? []) {
      if (!ids.has(ph.after)) bad(w, `photo after unknown section ${ph.after}`);
      const p = photoKeys[ph.photoKey];
      if (!p || !p.credit?.author) bad(w, `photo ${ph.photoKey} missing or uncredited`);
      if (words(ph.caption ?? "") < 6) bad(w, "photo caption too short");
    }
    if ((data.photos ?? []).length < 2) bad(w, "at least 2 credited inline photos");
  } else if (f.endsWith("-long-form.json")) {
    for (const [slug, lf] of Object.entries(data)) {
      const w = `${f} ${slug}`;
      longCount++;
      if (!places.has(slug)) bad(w, "unknown attraction slug");
      if (seenLong.has(slug)) bad(w, `duplicate of ${seenLong.get(slug)}`);
      seenLong.set(slug, f);
      const d = lf.description ?? "";
      if (words(d) < 35 || words(d) > 70) bad(w, `description has ${words(d)} words (35-70)`);
      const ps = lf.paragraphs ?? [];
      const total = ps.reduce((n, p) => n + words(p), 0);
      if (ps.length < 3) bad(w, "needs at least 3 paragraphs");
      if (total < 140 || total > 700) bad(w, `main text has ${total} words (140-700)`);
      if (ps.some((p) => words(p) < 15)) bad(w, "a paragraph under 15 words");
      const tips = lf.tips ?? [];
      if (tips.length < 2 || tips.length > 5) bad(w, "2-5 tips required");
      if (tips.some((t) => words(t) < 5 || words(t) > 45)) bad(w, "tip length 5-45 words");
      const srcs = lf.sources ?? [];
      if (srcs.length < 2) bad(w, "at least 2 sources");
      if (!srcs.every((s) => isHttps(s.url) && (s.label ?? "").length > 5)) bad(w, "sources need https url and a label");
      if (new Set(srcs.map((s) => s.url)).size !== srcs.length) bad(w, "duplicate source url");
      if (!/^2026-\d{2}-\d{2}$/.test(lf.checked ?? "")) bad(w, "checked must be 2026-MM-DD");
      const text = [d, ...ps, ...tips].join("\n");
      if (VOLATILE.test(text)) bad(w, `price/opening-time wording: ${text.match(VOLATILE)[0]}`);
      if (MARKUP.test(text)) bad(w, "markup in text");
      const sentences = ps.join(" ").split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.length > 40);
      if (new Set(sentences).size !== sentences.length) bad(w, "repeated sentence");
    }
  } else {
    assert.ok(Array.isArray(data), `${f} must be an array`);
    for (const h of data) {
      const w = `${f} ${h.slug}`;
      histCount++;
      if (!places.has(h.slug)) bad(w, "unknown attraction slug");
      if (seenHist.has(h.slug)) bad(w, `duplicate of ${seenHist.get(h.slug)}`);
      seenHist.set(h.slug, f);
      if (words(h.introduction ?? "") < 15) bad(w, "introduction too short");
      const ch = h.chapters ?? [];
      if (ch.length < 2) bad(w, "at least 2 chapters");
      for (const c of ch) {
        if (!Array.isArray(c) || c.length !== 2) { bad(w, "chapter must be [heading, narrative]"); continue; }
        if (c[0].length < 8) bad(w, `chapter heading too short: ${c[0]}`);
        if (words(c[1]) < 40 || words(c[1]) > 220) bad(w, `chapter "${c[0]}" has ${words(c[1])} words (40-220)`);
      }
      const add = h.additionalSources ?? [];
      if (add.length < 1 || !add.every((s) => isHttps(s.url) && (s.label ?? "").length > 5)) bad(w, "needs at least 1 cited source with https url and label");
      for (const st of h.stories ?? []) {
        stories++;
        if (!["historical-account", "local-tradition", "religious-tradition"].includes(st.kind)) bad(w, `story kind ${st.kind}`);
        if (!st.title || !Array.isArray(st.description) || !st.description.length) bad(w, "story needs title and description[]");
        if (!isHttps(st.sourceUrl) || !(st.sourceLabel ?? "").length) bad(w, "story needs sourceUrl and sourceLabel");
        if (st.kind !== "historical-account" && !/tradition|legend|story|said|according|told|believed|recount/i.test((st.description ?? []).join(" "))) {
          bad(w, "a tradition/legend must be worded as one (e.g. 'according to', 'tradition')");
        }
      }
      const text = [h.introduction, ...ch.map((c) => c[1]), ...(h.stories ?? []).flatMap((s) => s.description)].join("\n");
      if (VOLATILE.test(text)) bad(w, `price/opening-time wording: ${text.match(VOLATILE)[0]}`);
      if (MARKUP.test(text)) bad(w, "markup in text");
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`Batches valid: ${longCount} long-form texts, ${histCount} histories, ${stories} labelled stories, ${guideCount} guides in ${files.length} file(s).`);
