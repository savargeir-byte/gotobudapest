import Link from "next/link";
import "../marketplace.css";
import { CARD_SIZES, cardImage } from "@/lib/marketplace/images";
import CardMedia from "./CardMedia";
import { CATEGORIES, PROVIDER_LABEL, type MarketplaceProduct } from "@/lib/marketplace/types";

const catLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label ?? k;

// One product. The ONLY link on the card opens its detailed product page.
// The provider hand-off (the exact affiliate URL)
// lives on that page as the final step. Every field shown was supplied by the provider API:
// nothing is invented, and a missing field is simply not rendered.
export default function ProductCard({
  product: p,
  priority = false,
  compact = false,
  rail = false,
  ctaLabel,
}: {
  product: MarketplaceProduct;
  priority?: boolean;
  compact?: boolean;
  // Inside the narrow side rail on editorial pages (a different card width from the full-width rows).
  rail?: boolean;
  ctaLabel?: "Check availability" | "View details";
}) {
  const provider = PROVIDER_LABEL[p.provider];
  const action = ctaLabel ?? (compact ? "Check availability" : "View details");
  const cats = p.categories.slice(0, 2);
  // Responsive provider photo (srcset from the API's own renditions) or none: no thumbnail is
  // ever stretched and no empty image box is drawn (the card is then a designed text card).
  const img = cardImage(p.image, rail ? "rail" : compact ? "row" : "grid");
  // No usable supplier photo: use a correctly credited venue photograph or an explicitly
  // illustrative Budapest/category photograph. Never imply an editorial photo is the product.
  const venue = !img ? p.venuePhoto : undefined;
  return (
    <article className="card mk-card" data-provider={p.provider} data-product={p.id}>
      <CardMedia
        img={img}
        alt={p.image?.alt ?? p.title}
        provider={provider}
        venue={venue}
        fallback={p.fallbackPhoto ?? p.venuePhoto}
        sizes={CARD_SIZES[rail ? "rail" : compact ? "row" : "grid"]}
        priority={priority}
      />
      <div className="card-body">
        {!img && !venue ? (
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
              aria-label={`${action}: ${p.title} (${provider})`}
            >
              {action} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        <p className="mk-disclosure">Booking is completed with {provider}.</p>
      </div>
    </article>
  );
}
