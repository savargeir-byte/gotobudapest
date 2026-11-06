import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

// A venue photograph reaches the page either as the local 640/1280 WebP pair (local content fallback) or, when the
// content comes from Sanity, as the same photograph served from cdn.sanity.io at width 640 or 1280. Sanity names an
// asset by the SHA-1 of the uploaded file, which is the local 1280 file, so a test can still prove it is the right photo.
const CDN = "https://cdn\\.sanity\\.io/images/ut6qxuke/production";

/** Any of our 640 px card photographs. */
export const ANY_PHOTO_640 = new RegExp(`^(/assets/photos/[a-z0-9-]+-640\\.webp|${CDN}/[0-9a-f]{40}-\\d+x\\d+\\.[a-z]+\\?w=640(&[^ ]*)?)$`);

const sha1Of = (slug: string) =>
  createHash("sha1").update(readFileSync(path.join(process.cwd(), "public", "assets", "photos", `${slug}-1280.webp`))).digest("hex");

/** The 640 src of one specific photograph, local or Sanity. */
export function photoSrc640(slug: string) {
  return new RegExp(`^(/assets/photos/${slug}-640\\.webp|${CDN}/${sha1Of(slug)}-\\d+x\\d+\\.[a-z]+\\?w=640(&[^ ]*)?)$`);
}

/** The "640w, 1280w" srcset of one specific photograph, local or Sanity. */
export function photoSrcset(slug: string) {
  const sha = sha1Of(slug);
  return new RegExp(
    `^(/assets/photos/${slug}-640\\.webp 640w, /assets/photos/${slug}-1280\\.webp 1280w|` +
      `${CDN}/${sha}-\\d+x\\d+\\.[a-z]+\\?w=640[^ ]* 640w, ${CDN}/${sha}-\\d+x\\d+\\.[a-z]+\\?w=1280[^ ]* 1280w)$`,
  );
}
