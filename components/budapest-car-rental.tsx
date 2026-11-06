// GoIceCars is a sister travel brand. The link carries pickup=BUD (Budapest Airport) and the #rental-search anchor.
// Whether the GoIceCars search preselects the airport depends on that site's own prefill (GoIceCars PR #80), so the
// copy here never promises it: the visitor picks pickup, dates and vehicle on GoIceCars.
export default function BudapestCarRental() {
  return (
    <div className="budapest-car-rental" data-testid="budapest-car-rental">
      <div className="eyebrow">EXPLORE BEYOND THE CITY</div>
      <h2>Car rental in Budapest</h2>
      <p>Planning a day trip outside Budapest? Start a rental car search with our sister site GoIceCars, then choose your pickup, dates and vehicle.</p>
      <a className="primary" href="https://www.goicecars.com/en?pickup=BUD#rental-search" target="_blank" rel="noopener noreferrer sponsored">
        Search Budapest rental cars ↗
      </a>
      <p>No prices are shown here. Offers, final prices and bookings are handled by the rental provider.</p>
    </div>
  );
}
