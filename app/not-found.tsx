import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro not-found">
          <div className="eyebrow">ERROR 404</div>
          <h1>
            This street
            <br />
            <em>isn&apos;t on the map.</em>
          </h1>
          <p>
            The page you were looking for does not exist or has moved. Start
            again from one of these places.
          </p>
          <div className="dialog-actions">
            <Link className="primary" href="/">
              Back to the homepage ↗
            </Link>
            <Link className="outline" href="/attractions">
              Browse 100 attractions
            </Link>
            <Link className="outline" href="/guides">
              Read the guides
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
