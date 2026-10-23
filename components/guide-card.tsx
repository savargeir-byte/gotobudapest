import Image from "next/image";
import Link from "next/link";
import { type Guide, guidePhoto, readingMinutes } from "../lib/guides";
export default function GuideCard({ guide }: { guide: Guide }) {
  const photo = guidePhoto(guide);
  return (
    <article className="card guide-card">
      <div className="guide-card-image">
        <Image
          src={photo.src640}
          alt={photo.alt}
          fill
          sizes="(max-width:760px) 88vw, 30vw"
        />
      </div>
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
