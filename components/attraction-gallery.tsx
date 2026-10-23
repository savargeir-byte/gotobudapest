"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryImage } from "../lib/attraction-galleries";

function PhotoAttribution({ image }: { image: GalleryImage }) {
  return (
    <span className="attraction-gallery-credit">
      Photo: {image.author} ·{" "}
      <a href={image.licenseUrl || image.sourceUrl} target="_blank" rel="noopener noreferrer">
        {image.license}
      </a>{" "}
      ·{" "}
      <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">
        Source ↗
      </a>
    </span>
  );
}

export default function AttractionGallery({
  images,
  attractionName,
}: {
  images: GalleryImage[];
  attractionName: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const lastOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowLeft")
        setSelected((i) => i === null ? null : (i - 1 + images.length) % images.length);
      if (event.key === "ArrowRight")
        setSelected((i) => i === null ? null : (i + 1) % images.length);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = lastOverflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [selected, images.length]);

  function open(index: number, button: HTMLButtonElement) {
    openerRef.current = button;
    setSelected(index);
  }

  if (images.length === 0) return null;
  const selectedImage = selected === null ? null : images[selected];

  return (
    <section className="section detail-panel attraction-gallery" id="photos" aria-labelledby="attraction-gallery-title">
      <div className="attraction-gallery-heading">
        <div>
          <div className="eyebrow">SEE MORE OF THE PLACE</div>
          <h2 id="attraction-gallery-title">{attractionName} in pictures</h2>
          <p>Explore verified photographs and their original sources before your visit.</p>
        </div>
        <span className="attraction-gallery-count">{images.length} photographs</span>
      </div>
      <div className="attraction-gallery-grid">
        {images.map((image, index) => (
          <figure className="attraction-gallery-tile" key={image.key}>
            <button
              type="button"
              className="attraction-gallery-open"
              onClick={(event) => open(index, event.currentTarget)}
              aria-label={`View photograph ${index + 1} of ${images.length}: ${image.alt}`}
            >
              <Image
                src={image.thumb}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 90vw, (max-width: 1100px) 44vw, 30vw"
                loading="lazy"
              />
              <span className="attraction-gallery-zoom" aria-hidden="true">⤢</span>
            </button>
            <figcaption>
              <p>{image.caption}</p>
              <PhotoAttribution image={image} />
            </figcaption>
          </figure>
        ))}
      </div>

      {selectedImage && selected !== null ? (
        <div
          className="attraction-gallery-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            className="attraction-gallery-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${attractionName} image gallery, image ${selected + 1} of ${images.length}`}
          >
            <div className="attraction-gallery-dialog-top">
              <span>{selected + 1} / {images.length}</span>
              <button ref={closeRef} type="button" className="attraction-gallery-close" onClick={() => setSelected(null)} aria-label="Close gallery">×</button>
            </div>
            <div className="attraction-gallery-dialog-media">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: "contain" }}
              />
              {images.length > 1 ? (
                <>
                  <button type="button" className="attraction-gallery-prev" onClick={() => setSelected((selected - 1 + images.length) % images.length)} aria-label="Previous photograph">‹</button>
                  <button type="button" className="attraction-gallery-next" onClick={() => setSelected((selected + 1) % images.length)} aria-label="Next photograph">›</button>
                </>
              ) : null}
            </div>
            <div className="attraction-gallery-dialog-caption">
              <p>{selectedImage.caption}</p>
              <PhotoAttribution image={selectedImage} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
