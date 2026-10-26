"use client";
import Link from "next/link";
export default function BookingError({ reset }: { reset: () => void }) {
  return (
    <main className="section article-title">
      <h1>This experience could not be loaded.</h1>
      <p>The provider may be temporarily unavailable. Please try again.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
      <p>
        <Link href="/tours">Back to tours & tickets</Link>
      </p>
    </main>
  );
}
