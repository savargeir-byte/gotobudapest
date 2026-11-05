// Direct Viator affiliate handoff: customers select date, travellers and options on Viator.
// No duplicate availability form, booking state, or non-transactional checks on GoToBuda.
import "../booking-panel.css";

export default function ViatorAvailability({ bookingUrl }: { bookingUrl: string }) {
  return (
    <section className="booking-panel vp-panel vp-direct" id="availability" aria-labelledby="availability-heading">
      <h2 id="availability-heading">Book this tour on Viator</h2>
      <p>Go straight to this experience on Viator to choose your date, number of guests and tour option.</p>
      <a className="primary" href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer">
        Book on Viator ↗
      </a>
      <small>Availability, final price and payment are handled securely on Viator.</small>
    </section>
  );
}
