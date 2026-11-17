"use client";

import { useState } from "react";
import { creditLinks } from "@/lib/photo-attribution";
import type { CardImageProps } from "@/lib/marketplace/images";
import type { VenuePhoto } from "@/lib/marketplace/types";

// The picture at the top of a product card.
//  1. The supplier's own photograph whenever the provider supplied a usable one (served unchanged from the provider CDN).
//  2. If that photograph does not load (removed, blocked, hot-link refused), the card switches to a credited photograph of
//     ours instead of showing a broken-image icon over an empty box.
//  3. With no supplier photograph at all: a credited photograph of the exact venue, or an illustration of the city or the
//     category. Every photograph of ours says what it is ("Photo of ...", "Featured stop: ...", "Illustrative photo: ...")
//     and is never worded as a photograph of the product itself.
export default function CardMedia({
  img,
  alt,
  provider,
  venue,
  fallback,
  sizes,
  priority,
}: {
  img?: CardImageProps;
  alt: string;
  provider: string;
  venue?: VenuePhoto;
  fallback?: VenuePhoto;
  sizes: string;
  priority: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const own = img && !failed ? undefined : img ? fallback : venue;
  const { licenseHref, sourceHref, sourceLabel } = own ? creditLinks(own.credit) : { licenseHref: undefined, sourceHref: undefined, sourceLabel: "Source" };

  if (img && !failed) {
    return (
      <div className="mk-card-img" data-source-limited={img.sourceLimited ? "true" : undefined}>
        {/* Remote provider CDN photos are served unchanged (images.unoptimized): srcset/sizes let the
            browser pick the rendition the provider really supplied. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={(el) => {
            // An error can fire before this component hydrates: look at the element's state once it is mounted.
            if (el && el.complete && el.naturalWidth === 0 && el.currentSrc) setFailed(true);
          }}
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.sizes}
          {...(img.width && img.height ? { width: img.width, height: img.height } : {})}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
        <span className="mk-badge">{provider}</span>
      </div>
    );
  }
  if (!own) return null;
  return (
    <>
      <div className="mk-card-img mk-venue-img" data-venue-photo={own.venueSlug} data-supplier-photo-failed={failed ? "true" : undefined}>
        {/* Our own 640/1280 WebP renditions, served from this site. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={own.src640}
          srcSet={`${own.src640} 640w, ${own.src1280} 1280w`}
          sizes={sizes}
          {...(own.width && own.height ? { width: own.width, height: own.height } : {})}
          alt={own.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
        <span className="mk-badge">{provider}</span>
      </div>
      <p className="mk-venue-credit">
        {own.relation === "illustrative"
          ? `Illustrative photo: ${own.venue}, not this specific tour or ticket.`
          : own.relation === "featured"
            ? `Featured stop: ${own.venue}. Photo of ${own.venue}, not a photo of this product.`
            : `Photo of ${own.venue}, not a photo of this product.`}{" "}
        Photo: {own.credit.author}
        {own.credit.license ? (
          <>
            {" "}·{" "}
            {licenseHref ? (
              <a href={licenseHref} target="_blank" rel="noopener noreferrer">
                {own.credit.license}
              </a>
            ) : (
              own.credit.license
            )}
          </>
        ) : null}
        {sourceHref ? (
          <>
            {" "}·{" "}
            <a href={sourceHref} target="_blank" rel="noopener noreferrer">
              {sourceLabel}
            </a>
          </>
        ) : null}
      </p>
    </>
  );
}
