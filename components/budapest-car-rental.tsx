// GoIceCars is a sister travel brand. The landing URL selects Budapest Airport (BUD)
// when the corresponding GoIceCars landing-page prefill is deployed.
export default function BudapestCarRental() {
  return (
    <div className="budapest-car-rental">
      <div className="eyebrow">EXPLORE BEYOND THE CITY</div>
      <h2>Car rental in Budapest</h2>
      <p>Planning a day trip outside Budapest? Start a car search at Budapest Ferenc Liszt Airport (BUD), then choose your dates, driver details and vehicle.</p>
      <a className="primary" href="https://www.goicecars.com/en?pickup=BUD#rental-search" target="_blank" rel="noopener noreferrer sponsored">
        Search Budapest rental cars ↗
      </a>
      <p>Compare available offers with our sister site GoIceCars. Final prices and bookings are handled by the rental provider.</p>
    </div>
  );
}
