import { urlFor } from "@/sanity/lib/image";
import type {
  Attraction,
  Faq,
  Guide,
  Photo,
  PtBlock,
  Seo,
  SiteSettings,
  SourceLink,
  Topic,
} from "../types";

// Everything coming out of the dataset is treated as untrusted input: strings are
// only rendered through React (escaped), URLs must be https, and rich text is
// limited to plain blocks (see components/portable-body.tsx).

type RawPhoto = {
  asset?: { _ref?: string } | null;
  hotspot?: unknown;
  crop?: unknown;
  alt?: string;
  caption?: string;
  creditTitle?: string;
  creditAuthor?: string;
  creditLicense?: string;
  creditLicenseUrl?: string;
  creditSourceUrl?: string;
} | null;

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function mapPhoto(
  raw: RawPhoto | undefined,
  fallbackAlt: string,
): Photo | undefined {
  if (!raw?.asset?._ref) return undefined;
  const source = {
    asset: raw.asset,
    hotspot: raw.hotspot,
    crop: raw.crop,
  } as never;
  const build = (w: number, q: number) =>
    urlFor(source).width(w).fit("max").auto("format").quality(q).url();
  const sourceUrl = safeUrl(raw.creditSourceUrl);
  return {
    src640: build(640, 75),
    src1280: build(1280, 78),
    alt: raw.alt?.trim() || fallbackAlt,
    credit:
      raw.creditAuthor || raw.creditLicense || sourceUrl
        ? {
            title: raw.creditTitle ?? "",
            author: raw.creditAuthor ?? "",
            license: raw.creditLicense ?? "",
            licenseUrl: safeUrl(raw.creditLicenseUrl) ?? "",
            sourceUrl: sourceUrl ?? "",
          }
        : undefined,
  };
}

const clean = <T>(list: (T | null | undefined)[] | null | undefined): T[] =>
  (list ?? []).filter((x): x is T => x != null);
const blocks = (b: unknown): PtBlock[] | undefined =>
  Array.isArray(b)
    ? (b as PtBlock[]).filter((x) => x?._type === "block")
    : undefined;
const seo = (s: Seo | null | undefined): Seo | undefined =>
  s && (s.title || s.description)
    ? { title: s.title, description: s.description }
    : undefined;
const sources = (
  l: { label?: string; url?: string }[] | null | undefined,
): SourceLink[] =>
  clean(l).flatMap((s) => {
    const url = safeUrl(s.url);
    return url && s.label ? [{ label: s.label, url }] : [];
  });
const faqs = (l: Partial<Faq>[] | null | undefined): Faq[] =>
  clean(l).flatMap((f) =>
    f.question && f.answer ? [{ question: f.question, answer: f.answer }] : [],
  );

export type RawAttraction = {
  _id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string;
  body?: unknown;
  address?: string;
  lat?: number;
  lng?: number;
  operatingStatus?: string;
  notice?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  additionalSource?: string;
  checked?: string;
  featured?: boolean;
  seo?: Seo | null;
  heroImage?: RawPhoto;
  gallery?: RawPhoto[] | null;
  relatedGuides?: (string | null)[] | null;
};

export function mapAttraction(a: RawAttraction): Attraction | undefined {
  const sourceUrl = safeUrl(a.sourceUrl);
  if (!a.slug || !a.name || !a.description || !sourceUrl) return undefined;
  const gallery = clean((a.gallery ?? []).map((g) => mapPhoto(g, a.name)));
  return {
    id: a.slug,
    slug: a.slug,
    name: a.name,
    category: a.category ?? "Places",
    description: a.description,
    body: blocks(a.body),
    sourceUrl,
    sourceLabel: a.sourceLabel || "Official visitor information",
    checked: a.checked ?? "",
    address: a.address || undefined,
    coordinates:
      typeof a.lat === "number" && typeof a.lng === "number"
        ? { latitude: a.lat, longitude: a.lng }
        : undefined,
    status: a.operatingStatus || undefined,
    notice: a.notice || undefined,
    additionalSource: safeUrl(a.additionalSource),
    photo: mapPhoto(a.heroImage, a.name),
    gallery: gallery.length ? gallery : undefined,
    relatedGuides: a.relatedGuides ? clean(a.relatedGuides) : undefined,
    featured: a.featured || undefined,
    seo: seo(a.seo),
  };
}

export type RawGuide = {
  title: string;
  shortTitle?: string;
  slug: string;
  category: string | null;
  description: string;
  intro: string;
  highlights?: string[] | null;
  heroImage?: RawPhoto;
  imageCaption?: string;
  sections?: { id?: string; title?: string; body?: unknown }[] | null;
  faqs?: Partial<Faq>[] | null;
  sources?: { label?: string; url?: string }[] | null;
  related?: (string | null)[] | null;
  updated?: string;
  seo?: Seo | null;
};

export function mapGuide(g: RawGuide, fallbackPhoto: Photo): Guide | undefined {
  if (!g.slug || !g.title || !g.description || !g.intro) return undefined;
  const sections = clean(g.sections).flatMap((s, i) =>
    s.title
      ? [
          {
            id: s.id || `section-${i + 1}`,
            title: s.title,
            body: blocks(s.body) ?? [],
          },
        ]
      : [],
  );
  return {
    slug: g.slug,
    title: g.title,
    shortTitle: g.shortTitle || g.title,
    category: g.category ?? "Guides",
    description: g.description,
    photo: mapPhoto(g.heroImage, g.title) ?? fallbackPhoto,
    imageCaption: g.imageCaption || undefined,
    intro: g.intro,
    highlights: clean(g.highlights),
    sections,
    faqs: faqs(g.faqs),
    sources: sources(g.sources),
    related: clean(g.related),
    updated: g.updated ?? "",
    seo: seo(g.seo),
  };
}

export type RawTopic = {
  title: string;
  slug: string;
  eyebrow?: string;
  summary: string;
  intro: string;
  highlights?: string[] | null;
  heroImage?: RawPhoto;
  sections?: { title?: string; body?: unknown }[] | null;
  faqs?: Partial<Faq>[] | null;
  placesHeading?: string;
  placesIntro?: string;
  placeSlugs?: (string | null)[] | null;
  guides?: (string | null)[] | null;
  sources?: { label?: string; url?: string }[] | null;
  seo?: Seo | null;
};

export function mapTopic(t: RawTopic, fallbackPhoto: Photo): Topic | undefined {
  if (!t.slug || !t.title || !t.summary || !t.intro) return undefined;
  const s = seo(t.seo);
  return {
    slug: t.slug,
    title: t.title,
    eyebrow: t.eyebrow ?? "",
    summary: t.summary,
    description: s?.description ?? t.summary,
    photo: mapPhoto(t.heroImage, t.title) ?? fallbackPhoto,
    intro: t.intro,
    highlights: clean(t.highlights),
    faqs: faqs(t.faqs),
    sections: clean(t.sections).flatMap((x) =>
      x.title ? [{ title: x.title, body: blocks(x.body) ?? [] }] : [],
    ),
    placesHeading: t.placesHeading || "Places to explore",
    placesIntro: t.placesIntro ?? "",
    placeSlugs: clean(t.placeSlugs),
    guides: clean(t.guides),
    sources: sources(t.sources),
    seo: s,
  };
}

export type RawSettings = {
  featuredAttractions?: (string | null)[] | null;
  featuredGuides?: (string | null)[] | null;
  seo?: Seo | null;
} | null;

export function mapSettings(
  s: RawSettings,
  fallback: SiteSettings,
): SiteSettings {
  const fa = clean(s?.featuredAttractions);
  const fg = clean(s?.featuredGuides);
  return {
    featuredAttractions: fa.length ? fa : fallback.featuredAttractions,
    featuredGuides: fg.length ? fg : fallback.featuredGuides,
    seo: seo(s?.seo),
  };
}
