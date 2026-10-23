import Brand from "./brand";
import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer>
      <Brand footer />
      <p>
        Your next city story.
        <br />A sister site of{" "}
        <a
          href="https://www.goicetravel.is"
          target="_blank"
          rel="noopener noreferrer"
        >
          GoIceTravel ↗
        </a>
      </p>
      <div>
        <Link href="/attractions">Attractions</Link>
        <Link href="/guides">Travel guides</Link>
        <Link href="/#planner">Plan your trip</Link>
      </div>
      <small>© 2026 GoToBudapest · Made for curious travellers.</small>
    </footer>
  );
}
