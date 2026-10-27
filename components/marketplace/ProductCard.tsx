import Image from "next/image";
import Link from "next/link";
import "../marketplace.css";
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
  const src = p.image ? (p.image.small ?? p.image.src) : undefined;
  return (
    <article className="card mk-card" data-provider={p.provider} data-product={p.id}>
      {src && p.image ? (
        <div className="mk-card-img">
          <Image
            src={src}
            alt={p.image.alt}
            fill
            unoptimized
            referrerPolicy="no-referrer"
            sizes="(max-width: 760px) 92vw, (max-width: 1100px) 45vw, 28vw"
            priority={priority}
          />
          <span className="mk-badge">{provider}</span>
        </div>
      ) : null}
      <div className="card-body">
        {!src ? (
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
