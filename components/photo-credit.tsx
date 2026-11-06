import type { Photo } from "../lib/attractions";
import { creditLinks } from "../lib/photo-attribution";

export default function PhotoCredit({ photo }: { photo: Photo }) {
  const c = photo.credit;
  if (!c) return null;
  const { licenseHref, sourceHref, sourceLabel } = creditLinks(c);
  return (
    <>
      Photo: {c.author || "Wikimedia Commons contributor"}
      {c.license ? (
        <>
          {" "}·{" "}
          {licenseHref ? (
            <a href={licenseHref} target="_blank" rel="noopener noreferrer">
              {c.license}
            </a>
          ) : (
            c.license
          )}
        </>
      ) : null}
      {sourceHref ? (
        <>
          {" "}·{" "}
          <a href={sourceHref} target="_blank" rel="noopener noreferrer">
            {sourceLabel}
          </a>
        </>
      ) : null}
    </>
  );
}
