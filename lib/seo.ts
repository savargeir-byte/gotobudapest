import type { Metadata } from "next";
import { siteName } from "./site";

export const defaultShareImage = "/assets/danube.webp";

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
  return {
    title,
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
