import type { Photo } from "../lib/attractions";

export default function PhotoCredit({ photo }: { photo: Photo }) {
  const c = photo.credit;
  if (!c) return null;
  return (
    <>
      Photo: {c.author || "Wikimedia Commons contributor"} ·{" "}
      <a href={c.licenseUrl || c.sourceUrl} target="_blank" rel="noopener noreferrer">
        {c.license}
      </a>{" "}
      ·{" "}
      <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
        Wikimedia Commons
      </a>
    </>
  );
}
