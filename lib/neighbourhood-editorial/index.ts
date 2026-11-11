// Code-backed editorial for the 35 neighbourhood pages. The Sanity document stays the base (intro, hero, existing sections, FAQs);
// this layer appends extra sections, highlights, sources, places and guides, and may replace a hero that is unsuitable or duplicated
// (a registry entry keyed "hood-<slug>" in data/photos-hoods.json). Used by loadContent in lib/content.ts.
import { textToBlocks } from "../portable-text";
import type { Photo, Topic } from "../types";
import { editorials, hoodPhotos } from "./generated";

const bySlug = new Map(editorials.map((e) => [e.slug, e]));
export const neighbourhoodEditorialSlugs = [...bySlug.keys()].sort();
export const neighbourhoodPhotoSlugs = Object.keys(hoodPhotos).map((k) => k.replace(/^hood-/, "")).sort();

const union = <T,>(a: T[], b: T[] = [], key: (x: T) => string = String) => {
  const seen = new Set(a.map(key));
  return [...a, ...b.filter((x) => !seen.has(key(x)) && seen.add(key(x)))];
};

export function withNeighbourhoodEditorial(topics: Topic[]): Topic[] {
  return topics.map((t) => {
    const e = bySlug.get(t.slug);
    const hero = hoodPhotos[`hood-${t.slug}`] as Photo | undefined;
    if (!e && !hero) return t;
    const have = new Set(t.sections.map((s) => s.title.toLowerCase()));
    const sections = (e?.sections ?? [])
      .filter((s) => !have.has(s.title.toLowerCase()))
      .map((s, i) => ({ title: s.title, body: textToBlocks(s.paragraphs, undefined, `${t.slug}-ed${i}`) }));
    return {
      ...t,
      photo: hero ?? t.photo,
      sections: [...t.sections, ...sections],
      highlights: union(t.highlights, e?.highlights),
      placeSlugs: union(t.placeSlugs, e?.placeSlugs),
      guides: union(t.guides, e?.guides),
      sources: union(t.sources, e?.sources, (s) => s.url),
      seo: e?.seo ? { title: e.seo.title, description: e.seo.description } : t.seo,
      description: e?.seo?.description ?? t.description,
    };
  });
}
