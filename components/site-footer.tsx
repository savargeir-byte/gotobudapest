import Brand from "./brand";
import Link from "next/link";
import CookieSettingsLink from "./consent/cookie-settings-link";
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
        <Link href="/experiences">Experiences</Link>
        <Link href="/tours">Tours & Tickets</Link>
        <Link href="/neighbourhoods">Neighbourhoods</Link>
        <Link href="/guides">Travel guides</Link>
        <Link href="/visitor-guides">Visitor guides</Link>
        <Link href="/currency">HUF & money</Link>
        <Link href="/essentials">Essentials</Link>
        <Link href="/privacy">Privacy</Link>
        <CookieSettingsLink />
      </div>
      <small>© 2026 GoToBudapest · Made for curious travellers.</small>
    </footer>
  );
}
