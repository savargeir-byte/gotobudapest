// Direct Viator affiliate handoff: customers select date, travellers and options on Viator.
// No duplicate availability form, booking state, or non-transactional checks on GoToBuda.
// The panel repeats the facts a traveller weighs before leaving (price, rating, cancellation) exactly as Viator supplied them.
import "../booking-panel.css";

export default function ViatorAvailability({
  bookingUrl,
  price,
  rating,
  freeCancellation,
}: {
  bookingUrl: string;
  price?: string;
  rating?: { value: number; count: number };
  freeCancellation?: boolean;
}) {
  return (
    <section className="booking-panel vp-panel vp-direct" id="availability" aria-labelledby="availability-heading">
      <h2 id="availability-heading">Book this tour on Viator</h2>
      {price ? (
        <p className="vp-panel-price">
          From <strong>{price}</strong>
        </p>
      ) : null}
      {rating || freeCancellation ? (
        <ul className="vp-panel-facts">
          {rating ? (
            <li>
              <span aria-hidden="true">★</span> <strong>{rating.value.toFixed(1)}</strong>{" "}
              <small>({rating.count.toLocaleString("en-GB")} reviews)</small>
            </li>
          ) : null}
          {freeCancellation ? <li className="vp-panel-green">Free cancellation, see the terms on Viator</li> : null}
        </ul>
      ) : null}
      <p>Go straight to this experience on Viator to choose your date, number of guests and tour option.</p>
      <a className="primary" href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer">
        Book on Viator ↗
      </a>
      <small>Availability, final price and payment are handled securely on Viator.</small>
    </section>
  );
}
