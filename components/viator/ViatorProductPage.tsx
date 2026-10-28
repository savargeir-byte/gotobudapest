// Internal Viator product page: everything the Partner API returned for the product,
// then availability / options / prices, and the provider handoff LAST.
//
// Order of the page (the owner's requirement): gallery -> title and facts -> description,
// highlights, itinerary, logistics, inclusions, additional info, cancellation -> availability and
// prices -> "Continue to Viator". The only link to viator.com is the final handoff inside the
// availability panel and it uses the API's productUrl unchanged. Sections the API did not
// return are not rendered. Nothing here is invented.
import type { BookingProduct } from "../../lib/booking/products";
import type { ScheduleView } from "../../lib/booking/viator-schedules";
import ViatorGallery from "./ViatorGallery";
import ViatorAvailability, { type BandInfo } from "./ViatorAvailability";

const BAND_LABEL: Record<string, string> = {
  ADULT: "Adult",
  CHILD: "Child",
  YOUTH: "Youth",
  INFANT: "Infant",
  SENIOR: "Senior",
  TRAVELER: "Traveller",
};

function bandsOf(product: BookingProduct, schedule: ScheduleView, max: number): BandInfo[] {
  const fromProduct = (product.ageBands ?? []).map((b) => ({
    ageBand: b.ageBand,
    label:
      (BAND_LABEL[b.ageBand] ?? b.ageBand) +
      (b.startAge != null ? ` (age ${b.startAge}${b.endAge != null ? `–${b.endAge}` : "+"})` : ""),
    min: b.minTravelersPerBooking ?? 0,
    max: b.maxTravelersPerBooking ?? max,
  }));
  if (fromProduct.length) return fromProduct;
  if (schedule.status !== "ok") return [];
  return schedule.bands.map((b) => ({
    ageBand: b.ageBand,
    label: BAND_LABEL[b.ageBand] ?? b.ageBand,
    min: b.min ?? 0,
    max: b.max ?? max,
  }));
}

function minutesLabel(m: number) {
  return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
}

export default function ViatorProductPage({
  product,
  schedule,
}: {
  product: BookingProduct;
  schedule: ScheduleView;
}) {
  const v = product.viator;
  if (!v) return null;
  const bands = bandsOf(product, schedule, v.requirements.max ?? 15);
  // Without any traveller categories there is nothing to price: say so instead of guessing.
  const view: ScheduleView = bands.length || schedule.status !== "ok" ? schedule : { status: "empty" };
  const fromPrice = view.status === "ok" ? view.fromPrice : undefined;
  const currency = view.status === "ok" ? view.currency : "EUR";
  const price =
    fromPrice !== undefined
      ? new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(fromPrice)
      : "";
  const description = v.paragraphs.length ? v.paragraphs : product.description ? [product.description] : [];
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(description[0] ? { description: description[0] } : {}),
    ...(v.images.length ? { image: v.images.slice(0, 5).map((i) => i.large) } : {}),
    ...(v.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: v.rating.value,
            reviewCount: v.rating.count,
          },
        }
      : {}),
    ...(fromPrice !== undefined
      ? { offers: { "@type": "AggregateOffer", lowPrice: fromPrice, priceCurrency: currency } }
      : {}),
  };
  const facts: { label: string; value: string }[] = [
    ...(v.durationLabel ? [{ label: "Duration", value: v.durationLabel }] : []),
    ...(v.languages.length ? [{ label: "Languages", value: v.languages.join(", ") }] : []),
    ...(v.confirmation
      ? [
          {
            label: "Confirmation",
            value:
              v.confirmation === "INSTANT"
                ? "Instant confirmation"
                : v.confirmation === "MANUAL"
                  ? "Confirmed manually by the supplier"
                  : "Instant, then confirmed manually",
          },
        ]
      : []),
    ...(v.supplier ? [{ label: "Operated by", value: v.supplier }] : []),
  ];

  return (
    <div className="vp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="eyebrow">BUDAPEST · VIATOR</div>
      <h1>{product.title}</h1>

      <div className="vp-summary">
        {v.rating ? (
          <span className="vp-rating" aria-label={`Rated ${v.rating.value.toFixed(1)} out of 5 from ${v.rating.count} reviews`}>
            ★ <strong>{v.rating.value.toFixed(1)}</strong> <small>({v.rating.count.toLocaleString("en-GB")} reviews)</small>
          </span>
        ) : null}
        {v.durationLabel ? <span>{v.durationLabel}</span> : null}
        {v.cancellation?.free ? <span className="vp-chip">Free cancellation</span> : null}
        {price ? (
          <span>
            From <strong>{price}</strong>
          </span>
        ) : null}
        <a className="vp-jump" href="#availability">
          Check availability &amp; prices ↓
        </a>
      </div>

      <ViatorGallery images={v.images} title={product.title} />

      <div className="vp-layout">
        <article className="vp-details">
          {description.length ? (
            <section aria-labelledby="vp-about">
              <h2 id="vp-about">About this experience</h2>
              {description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ) : null}

          {v.highlights.length ? (
            <section aria-labelledby="vp-highlights">
              <h2 id="vp-highlights">Highlights</h2>
              <ul className="vp-list">
                {v.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {facts.length ? (
            <section aria-labelledby="vp-facts">
              <h2 id="vp-facts">At a glance</h2>
              <dl className="vp-facts">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {v.itinerary ? (
            <section aria-labelledby="vp-itinerary">
              <h2 id="vp-itinerary">Itinerary</h2>
              {v.itinerary.activity ? <p>{v.itinerary.activity}</p> : null}
              {v.itinerary.skipTheLine ? <p className="vp-chip">Skip the line</p> : null}
              {v.itinerary.days.map((d, di) => (
                <div key={di}>
                  {d.title ? <h3>{d.title}</h3> : null}
                  <ol className="vp-itinerary">
                    {d.items.map((it, i) => (
                      <li key={i}>
                        {it.text}
                        {it.minutes || it.passBy || it.admission ? (
                          <small>
                            {[
                              it.minutes ? minutesLabel(it.minutes) : "",
                              it.passBy ? "Pass by, no stop" : "",
                              it.admission === "YES" ? "Admission included" : it.admission === "NO" ? "Admission not included" : "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          ) : null}

          {v.logistics.start.length || v.logistics.end.length ? (
            <section aria-labelledby="vp-meeting">
              <h2 id="vp-meeting">Meeting and end point</h2>
              {v.logistics.start.length ? (
                <>
                  <h3>Start</h3>
                  <ul className="vp-list">
                    {v.logistics.start.map((s, i) => (
                      <li key={i}>
                        {s.description}
                        {s.location && s.location !== s.description ? <small> {s.location}</small> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {v.logistics.end.length ? (
                <>
                  <h3>End</h3>
                  <ul className="vp-list">
                    {v.logistics.end.map((s, i) => (
                      <li key={i}>
                        {s.description}
                        {s.location && s.location !== s.description ? <small> {s.location}</small> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ) : null}

          {v.inclusions.length || v.exclusions.length ? (
            <section aria-labelledby="vp-included" className="vp-incl">
              <h2 id="vp-included">What is included</h2>
              <div className="vp-incl-grid">
                {v.inclusions.length ? (
                  <div>
                    <h3>Included</h3>
                    <ul className="vp-list vp-yes">
                      {v.inclusions.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {v.exclusions.length ? (
                  <div>
                    <h3>Not included</h3>
                    <ul className="vp-list vp-no">
                      {v.exclusions.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {v.options.length > 1 || v.options.some((o) => o.description) ? (
            <section aria-labelledby="vp-options">
              <h2 id="vp-options">Options</h2>
              <ul className="vp-options">
                {v.options.map((o) => (
                  <li key={o.code}>
                    <strong>{o.title}</strong>
                    {o.description ? <p>{o.description}</p> : null}
                    {o.languages.length ? <small>Languages: {o.languages.join(", ")}</small> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {bands.length ? (
            <section aria-labelledby="vp-travellers">
              <h2 id="vp-travellers">Who can book</h2>
              <ul className="vp-list">
                {bands.map((b) => (
                  <li key={b.ageBand}>{b.label}</li>
                ))}
                {v.requirements.min && v.requirements.min > 1 ? (
                  <li>At least {v.requirements.min} travellers per booking</li>
                ) : null}
                {v.requirements.max ? <li>At most {v.requirements.max} travellers per booking</li> : null}
                {v.requirements.adultRequired ? <li>An adult must be part of the booking</li> : null}
              </ul>
            </section>
          ) : null}

          {v.additionalInfo.length ? (
            <section aria-labelledby="vp-info">
              <h2 id="vp-info">Good to know</h2>
              <dl className="vp-info">
                {v.additionalInfo.map((a, i) => (
                  <div key={i}>
                    <dt>{a.label}</dt>
                    <dd>{a.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {v.cancellation ? (
            <section aria-labelledby="vp-cancel">
              <h2 id="vp-cancel">Cancellation policy</h2>
              {v.cancellation.free ? <p className="vp-chip">Free cancellation</p> : null}
              {v.cancellation.description ? <p>{v.cancellation.description}</p> : null}
              {v.cancellation.tiers.length ? (
                <ul className="vp-list">
                  {v.cancellation.tiers.map((t, i) => (
                    <li key={i}>
                      {t.percent}% refund
                      {t.fromDays != null
                        ? t.toDays != null
                          ? ` when cancelled ${t.fromDays}–${t.toDays} days before`
                          : ` when cancelled ${t.fromDays}+ days before`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              {v.cancellation.badWeather ? <p>Cancelled with a full refund if the weather is bad.</p> : null}
            </section>
          ) : null}

          <p className="booking-note">
            Product information and photographs supplied by Viator. Check final inclusions and
            cancellation terms on Viator before you book.
          </p>
        </article>

        <aside className="vp-aside">
          <ViatorAvailability
            code={product.id}
            bookingUrl={product.bookingUrl}
            bands={bands}
            options={v.options.map((o) => ({ code: o.code, title: o.title }))}
            requirements={v.requirements}
            schedule={view}
          />
        </aside>
      </div>

      {/* Mobile only: an internal anchor to the availability section, never an external link. */}
      <div className="vp-sticky">
        <div>
          {price ? (
            <span>
              From <strong>{price}</strong>
            </span>
          ) : (
            <span>Dates &amp; prices</span>
          )}
        </div>
        <a className="primary" href="#availability">
          Check availability
        </a>
      </div>
    </div>
  );
}
