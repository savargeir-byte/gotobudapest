import type { Metadata } from "next";
import { siteName } from "./site";

export const defaultShareImage = "/assets/danube.webp";

// Search results show roughly 155-160 characters of a description and about 60 characters of a title (site name included).
export const MAX_DESCRIPTION = 160;
const SUFFIX = ` | ${siteName}`;
export const MAX_TITLE_WITH_SUFFIX = 60;

// Shortens a description at a sentence end when one falls in the last 40 % of the allowance, otherwise at a word end with an ellipsis.
export function clampDescription(text: string, max = MAX_DESCRIPTION): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentence >= max * 0.6) return cut.slice(0, sentence + 1);
  const word = cut.slice(0, max - 1).replace(/[\s,;:.\-–—]+\S*$/, "");
  return `${word}…`;
}

export function pageMetadata({
  title,
  description,
  path,
  image = defaultShareImage,
  type = "website",
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  modifiedTime?: string;
}): Metadata {
  // Titles from the CMS sometimes already end with the site name, which the root title template adds as well.
  title = title.replace(/\s*\|\s*GoToBudapest\s*$/i, "");
  description = clampDescription(description);
  // A title that would pass ~60 characters with the site name appended drops the name instead of being cut mid-word in the results.
  const longTitle = title.length + SUFFIX.length > MAX_TITLE_WITH_SUFFIX;
  return {
    title: longTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
      locale: "en_GB",
      type,
      images: [{ url: image }],
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [image],
    },
  };
}
