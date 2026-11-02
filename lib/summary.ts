import { readingMinutes } from "./portable-text";
import type { Attraction, Guide } from "./types";

// Lightweight projection for client components: keeps the RSC payload small by
// leaving out rich text, galleries and credits.
export type AttractionSummary = Pick<
  Attraction,
  "id" | "slug" | "name" | "category" | "description" | "status" | "address"
> & {
  // Short text for compact cards: the full description (40-70 words for researched places) stays on the page.
  excerpt: string;
  photo?: { src640: string; alt: string };
};

const EXCERPT_WORDS = 30;

/** Whole sentences up to about 30 words; a single long sentence is cut at a word boundary with an ellipsis. */
export function cardExcerpt(text: string, max = EXCERPT_WORDS): string {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  if (words(text) <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if (words(out + s) > max) break;
    out += s;
  }
  if (out.trim()) return out.trim();
  return text.trim().split(/\s+/).slice(0, max).join(" ").replace(/[,;:\s]+$/, "") + "…";
}

export function summarize(a: Attraction): AttractionSummary {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    category: a.category,
    description: a.description,
    excerpt: cardExcerpt(a.description),
    status: a.status,
    address: a.address,
    photo: a.photo ? { src640: a.photo.src640, alt: a.photo.alt } : undefined,
  };
}

export type GuideSummary = Pick<
  Guide,
  "slug" | "title" | "shortTitle" | "category" | "description"
> & { photo: { src640: string; alt: string }; minutes: number };

export function summarizeGuide(g: Guide): GuideSummary {
  return {
    slug: g.slug,
    title: g.title,
    shortTitle: g.shortTitle,
    category: g.category,
    description: g.description,
    photo: { src640: g.photo.src640, alt: g.photo.alt },
    minutes: readingMinutes(g),
  };
}
