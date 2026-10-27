"use client";
/* eslint-disable @next/next/no-img-element -- Provider photos are served from the original licensed URLs. */
// Photo gallery for a Viator product: only the images the API returned, in the API's order
// (cover first). One large image plus a thumbnail row; every control is a real button.
import { useState } from "react";
import type { ViatorImage } from "../../lib/booking/viator-product";

export default function ViatorGallery({ images, title }: { images: ViatorImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(index, images.length - 1)];
  return (
    <section className="vp-gallery" aria-label={`Photos of ${title}`}>
      <figure className="vp-gallery-main">
        <img
          src={current.large}
          srcSet={current.srcSet || undefined}
          sizes="(max-width: 900px) 100vw, 860px"
          alt={current.alt}
          referrerPolicy="no-referrer"
          fetchPriority={index === 0 ? "high" : undefined}
        />
        {current.caption || current.credit ? (
          <figcaption>
            {current.caption}
            {current.credit ? <span> · Photo: {current.credit}</span> : null}
          </figcaption>
        ) : null}
      </figure>
      {images.length > 1 ? (
        <ul className="vp-thumbs">
          {images.map((img, i) => (
            <li key={img.large}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                <img src={img.small} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
