import Image from "next/image";
import Link from "next/link";
import type { AttractionSummary } from "@/lib/summary";

export default function AttractionCard({
  attraction: a,
  priority = false,
}: {
  attraction: AttractionSummary;
  priority?: boolean;
}) {
  return (
    <article className="card attraction-photo-card">
      {a.photo ? (
        <div className="card-img">
          <Image
            src={a.photo.src640}
            alt={a.photo.alt}
            fill
            sizes="(max-width:760px) 88vw, (max-width:1100px) 45vw, 30vw"
            priority={priority}
          />
          <span className="tag">{a.category.toUpperCase()}</span>
        </div>
      ) : null}
      <div className="card-body">
        {a.photo ? null : <small>{a.category.toUpperCase()}</small>}
        <h3>
          <Link href={`/attractions/${a.slug}`}>{a.name}</Link>
        </h3>
        {a.status ? <div className="tagline">{a.status}</div> : null}
        <p>{a.description}</p>
        <div className="card-bottom">
          <span>{a.photo ? "" : "Budapest"}</span>
          <span aria-hidden="true">Explore ↗</span>
        </div>
      </div>
    </article>
  );
}
