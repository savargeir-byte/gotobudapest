import Link from "next/link";
import "../marketplace.css";
import { cardImage } from "@/lib/marketplace/images";
import { CATEGORIES, PROVIDER_LABEL, type MarketplaceProduct } from "@/lib/marketplace/types";

const catLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label ?? k;

// One product. The ONLY link on the card is the internal "View details & availability"
// link to the GoToBudapest product page; the provider hand-off (the exact affiliate URL)
// lives on that page as the final step. Every field shown was supplied by the provider API:
// nothing is invented, and a missing field is simply not rendered.
export default function ProductCard({
  product: p,
  priority = false,
  compact = false,
}: {
  product: MarketplaceProduct;
  priority?: boolean;
  compact?: boolean;
}) {
  const provider = PROVIDER_LABEL[p.provider];
  const cats = p.categories.slice(0, 2);
  // Responsive provider photo (srcset from the API's own renditions) or none: no thumbnail is
  // ever stretched and no empty image box is drawn (the card is then a designed text card).
  const img = cardImage(p.image, compact ? "row" : "grid");
  return (
    <article className="card mk-card" data-provider={p.provider} data-product={p.id}>
      {img && p.image ? (
        <div className="mk-card-img" data-source-limited={img.sourceLimited ? "true" : undefined}>
          {/* Remote provider CDN photos are served unchanged (images.unoptimized): srcset/sizes let the
              browser pick the rendition the provider really supplied. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes={img.sizes}
            {...(img.width && img.height ? { width: img.width, height: img.height } : {})}
            alt={p.image.alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <span className="mk-badge">{provider}</span>
        </div>
      ) : null}
      <div className="card-body">
        {!img ? (
          <div className="mk-card-top">
            <span className="mk-badge">{provider}</span>
            {cats.map((c) => (
              <span className="mk-cat" key={c}>
                {catLabel(c)}
              </span>
            ))}
          </div>
        ) : cats.length ? (
          <div className="mk-card-top">
            {cats.map((c) => (
              <span className="mk-cat" key={c}>
                {catLabel(c)}
              </span>
            ))}
          </div>
        ) : null}
        <h3>{p.title}</h3>
        {p.summary && !compact ? <p className="mk-summary">{p.summary}</p> : null}
        <ul className="mk-meta">
          {p.rating ? (
            <li>
              <span aria-hidden="true">★</span>
              <span>
                {p.rating.value.toFixed(1)} <span className="mk-muted">({p.rating.count.toLocaleString("en-GB")})</span>
              </span>
              <span className="sr">{`Rated ${p.rating.value.toFixed(1)} out of 5 from ${p.rating.count} reviews`}</span>
            </li>
          ) : null}
          {p.durationLabel ? <li>⏱ {p.durationLabel}</li> : null}
          {p.freeCancellation ? <li className="mk-green">Free cancellation</li> : null}
        </ul>
        <div className="mk-card-foot">
          {p.price ? <span className="mk-price-label">{p.price.label}</span> : <span />}
          {p.detailUrl ? (
            <Link
              className="mk-cta"
              href={p.detailUrl}
              aria-label={`View details and availability: ${p.title} (${provider})`}
            >
              View details &amp; availability →
            </Link>
          ) : null}
        </div>
        <p className="mk-disclosure">Booking is completed with {provider}.</p>
      </div>
    </article>
  );
}
