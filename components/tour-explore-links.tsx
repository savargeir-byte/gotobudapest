import Link from "next/link";

// Onward paths from a product page that stay on the site: the product's own booking path is the primary action,
// these are quiet secondary links so a visitor can keep exploring Budapest before or after booking.
export default function TourExploreLinks({ place }: { place?: { slug: string; name: string } | null }) {
  return (
    <nav className="tour-explore" aria-label="Keep exploring Budapest">
      <h2>Keep exploring Budapest</h2>
      <ul>
        {place ? (
          <li>
            <Link href={`/attractions/${place.slug}`}>About {place.name}: history, visiting tips and nearby places</Link>
          </li>
        ) : null}
        <li><Link href="/attractions">Browse Budapest attractions</Link></li>
        <li><Link href="/guides">Read the Budapest guides</Link></li>
        <li><Link href="/tours">See more tours and tickets</Link></li>
      </ul>
    </nav>
  );
}
