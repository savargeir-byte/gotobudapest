// Pure comparison used by scripts/sanity-verify.mjs and tests/sanity-verify.test.ts: no network, no token, no file access.

// One row per published editorial document. `count(x)` of a missing array is null in GROQ, hence the coalesce.
export const editorialTypes = ["attraction", "guide", "experience", "neighbourhood", "region", "category", "siteSettings"];

export const verifyQuery = `*[_type in [${editorialTypes.map((t) => `"${t}"`).join(",")}] && !(_id in path("drafts.**"))]{
  _id, _type,
  "history": defined(historyIntro),
  "stories": coalesce(count(stories), 0),
  "historySections": coalesce(count(historySections), 0),
  "gallery": coalesce(count(gallery), 0),
  "sections": coalesce(count(sections), 0),
  "faqs": coalesce(count(faqs), 0),
  "hero": defined(heroImage.asset)
}`;

const len = (v) => (Array.isArray(v) ? v.length : 0);

// The same shape for a document the seed builds.
export function summarise(doc) {
  return {
    _id: doc._id,
    _type: doc._type,
    history: Boolean(doc.historyIntro),
    stories: len(doc.stories),
    historySections: len(doc.historySections),
    gallery: len(doc.gallery),
    sections: len(doc.sections),
    faqs: len(doc.faqs),
    hero: Boolean(doc.heroImage?.asset),
  };
}

const fields = ["history", "stories", "historySections", "gallery", "sections", "faqs", "hero"];

// missing: seeded document absent from the dataset (a failure). differs: present but a count differs from the seed (an editor may
// have changed it on purpose, so it is a warning right after an edit and a failure only straight after seeding). extra: editorial
// documents the seed did not create (new content from editors, informational).
export function compare(expectedDocs, actualRows) {
  const actual = new Map(actualRows.map((r) => [r._id, r]));
  const expected = expectedDocs.map(summarise);
  const ids = new Set(expected.map((e) => e._id));
  const missing = [];
  const differs = [];
  const byType = {};
  for (const e of expected) {
    const row = (byType[e._type] ??= { expected: 0, present: 0 });
    row.expected += 1;
    const a = actual.get(e._id);
    if (!a) {
      missing.push(e._id);
      continue;
    }
    row.present += 1;
    const diff = fields.filter((f) => (a[f] ?? (typeof e[f] === "boolean" ? false : 0)) !== e[f]);
    if (diff.length) differs.push({ id: e._id, fields: diff.map((f) => `${f}: expected ${e[f]}, found ${a[f]}`) });
  }
  const extra = actualRows.filter((r) => !ids.has(r._id)).map((r) => r._id);
  return { missing, differs, extra, byType, expectedTotal: expected.length, presentTotal: expected.length - missing.length };
}
