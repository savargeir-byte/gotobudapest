import Image from "next/image";
import type { Place } from "../lib/content";
export default function PlaceCard({
  place,
  saved,
  onSave,
  onOpen,
}: {
  place: Place;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="card">
      <div className="card-img">
        {place.image ? (
          <Image
            src={`/assets/${place.image}`}
            alt={place.name}
            fill
            sizes="(max-width:760px) 88vw, 30vw"
          />
        ) : (
          <div className="bath-art" aria-label="Illustration of thermal water">
            ≋<small>THERMAL BUDAPEST</small>
          </div>
        )}
        <span className="tag">{place.tag}</span>
        <button
          className={`save ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Save"} ${place.name}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="card-body">
        <small>{place.area}</small>
        <h3>{place.name}</h3>
        <p>{place.desc}</p>
        <div className="card-bottom">
          <span>{place.time}</span>
          <button onClick={onOpen}>Discover ↗</button>
        </div>
      </div>
    </article>
  );
}
