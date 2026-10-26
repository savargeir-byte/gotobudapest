"use client";

import { useEffect, useRef, useState } from "react";
import type { Offer, OfferContext } from "../lib/budapest-offers";

function offerPrice(offer: Offer): string | undefined {
  if (offer.priceLabel) return offer.priceLabel;
  if (offer.amount === undefined || !offer.currency) return undefined;
  try {
    return "From " + new Intl.NumberFormat("en-IE", {
      style: "currency", currency: offer.currency, maximumFractionDigits: 2,
    }).format(offer.amount);
  } catch {
    return undefined;
  }
}

export default function BookableOffers({
  kind,
  slug = "",
  heading = "Experiences worth discovering",
  description = "Real tours and tickets from our booking partners. Check dates, prices and terms on the provider&apos;s website.",
}: {
  kind: OfferContext;
  slug?: string;
  heading?: string;
  description?: string;
}) {
  const container = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (started) return;
    const target = container.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { rootMargin: "350px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ kind, slug });
    fetch(`/api/budapest-offers?${params}`, {
      cache: "default", signal: controller.signal, headers: { "Accept": "application/json" },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Catalogue not currently available");
      const body: unknown = await response.json();
      const rows = typeof body === "object" && body !== null && "offers" in body
        ? (body as { offers: unknown }).offers : [];
      if (!Array.isArray(rows)) return [];
      return rows as Offer[];
    }).then((items) => {
      if (!controller.signal.aborted) {
        setOffers(items);
        setStatus("ready");
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus("error");
    });
    return () => controller.abort();
  }, [started, kind, slug]);

  return (
    <section ref={container} className="section offer-section" aria-labelledby={`offers-${kind}-${slug || "all"}`}>
      <div className="section-heading">
        <div>
          <div className="eyebrow">BOOKABLE BUDAPEST · VERIFIED PROVIDER LINKS</div>
          <h2 id={`offers-${kind}-${slug || "all"}`}>{heading}</h2>
          <p>{description}</p>
        </div>
      </div>
      {status === "idle" || status === "loading" ? (
        <p className="offer-progress" role="status">Checking current partner listings…</p>
      ) : null}
      {status === "error" || (status === "ready" && offers.length === 0) ? (
        <p className="offer-progress" role="status">
          No verified bookable offers for this topic at the moment. Explore the sights and guides above, and check the official visitor sources for admission details.
        </p>
      ) : null}
      {status === "ready" && offers.length ? (
        <div className="offer-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.id}>
              {offer.photo ? (
                <div className="offer-image">
                  {/* Remote partner product photos are served unchanged, without re-hosting or claiming the wrong venue. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" decoding="async" referrerPolicy="no-referrer" src={offer.photo} alt={offer.title} />
                </div>
              ) : null}
              <div className="offer-info">
                <div className="offer-provider">{offer.provider}</div>
                <h3>{offer.title}</h3>
                {offer.description ? <p>{offer.description}</p> : null}
                <div className="offer-card-bottom">
                  <span className="offer-price">{offerPrice(offer) || "See live pricing"}</span>
                  <a
                    href={offer.detailUrl || offer.bookingUrl}
                    target={offer.detailUrl ? undefined : "_blank"}
                    rel={offer.detailUrl ? undefined : "noopener noreferrer sponsored"}
                    aria-label={offer.detailUrl ? `View ${offer.title} and booking options` : `View ${offer.title} on ${offer.provider} (opens new tab)`}
                  >
                    {offer.detailUrl ? "View tour & dates →" : "Check tickets ↗"}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {status === "ready" && offers.length ? (
        <p className="offer-disclaimer">
          Prices are supplier-provided indicators, not confirmed quotes. Availability and final
          prices depend on your travel date and participants. Booking and payment take place
          on the provider&apos;s website; links may earn GoToBudapest a commission.
        </p>
      ) : null}
    </section>
  );
}
