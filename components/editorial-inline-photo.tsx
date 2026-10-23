import Image from "next/image";
import { photos } from "../lib/attractions";
import PhotoCredit from "./photo-credit";

/**
 * Photo block used between editorial sections.
 * Maps one verified local Wikimedia image to a caption and attribution.
 * Can also be reused when the Guide body moves to Sanity Portable Text.
 */
export default function EditorialInlinePhoto({
  photoKey,
  caption,
}: {
  photoKey: string;
  caption: string;
}) {
  const photo = photos[photoKey];
  if (!photo) return null;

  return (
    <figure className="editorial-inline-photo">
      <div className="editorial-inline-photo__media">
        <picture>
          <source media="(max-width: 760px)" srcSet={photo.src640} />
          <Image
            src={photo.src1280}
            alt={photo.alt}
            fill
            sizes="(max-width: 760px) 88vw, 760px"
            loading="lazy"
          />
        </picture>
      </div>
      <figcaption className="editorial-inline-photo__caption">
        <span>{caption}</span>
        {photo.credit ? <span className="editorial-inline-photo__credit"><PhotoCredit photo={photo} /></span> : null}
      </figcaption>
    </figure>
  );
}
