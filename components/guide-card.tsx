import Image from "next/image";
import Link from "next/link";
import { type Guide, readingMinutes } from "../lib/guides";
export default function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="card guide-card">
      <Link
        href={`/guides/${guide.slug}`}
        className="guide-card-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={`/assets/${guide.image}`}
          alt=""
          fill
          sizes="(max-width:760px) 88vw, 30vw"
        />
      </Link>
      <div className="card-body">
        <small>
          {guide.category.toUpperCase()} · {readingMinutes(guide)} MIN READ
        </small>
        <h3>
          <Link href={`/guides/${guide.slug}`}>{guide.shortTitle}</Link>
        </h3>
        <p>{guide.description}</p>
        <Link className="textlink" href={`/guides/${guide.slug}`}>
          Read the guide ↗
        </Link>
      </div>
    </article>
  );
}
