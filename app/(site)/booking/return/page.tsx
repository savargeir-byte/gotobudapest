import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
export const metadata = {
  title: "Back from checkout | GoToBudapest",
  robots: { index: false, follow: false },
};
export default function ReturnPage() {
  return (
    <>
      <SiteHeader />
      <main className="section article-title">
        <h1>Welcome back.</h1>
        <p>
          If you completed checkout, TourDesk will provide your booking
          confirmation and ticket. Returning to this page does not confirm
          payment or a reservation.
        </p>
        <p>
          Check your confirmation email or contact TourDesk if you need help
          with your order.
        </p>
        <Link className="primary" href="/tours">
          Explore more Budapest experiences →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
