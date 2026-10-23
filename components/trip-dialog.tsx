"use client";
import { useEffect, useRef } from "react";
import { savedPlaces as places, experiences } from "../lib/content";
export type Modal = {
  kind: "place" | "trip" | "experience" | "district" | "privacy";
  id?: string;
} | null;
export default function TripDialog({
  modal,
  setModal,
  saved,
  toggleSave,
}: {
  modal: Modal;
  setModal: (m: Modal) => void;
  saved: string[];
  toggleSave: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (modal && !d?.open) d?.showModal();
    if (!modal && d?.open) d.close();
  }, [modal]);
  const place =
    modal?.kind === "place" ? places.find((p) => p.id === modal.id) : null;
  const exp = modal?.kind === "experience" ? experiences[modal.id!] : null;
  function download() {
    const text =
      "MY BUDAPEST TRIP\nGoToBudapest\n\n" +
      saved
        .map((id, i) => {
          const p = places.find((p) => p.id === id)!;
          return `${i + 1}. ${p.name}\n${p.area}\n${p.body}\n${p.url}\n`;
        })
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-budapest-trip.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <dialog
      ref={ref}
      id="detail"
      aria-labelledby="dialog-title"
      onClose={() => setModal(null)}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            setModal(null);
        }
      }}
    >
      <button
        className="close"
        aria-label="Close dialog"
        onClick={() => setModal(null)}
      >
        ×
      </button>
      <div id="detailcontent">
        {place ? (
          <>
            {place.image && (
              <img src={`/assets/${place.image}`} alt={place.name} />
            )}
            <div className="eyebrow mt-6">{place.area}</div>
            <h2 id="dialog-title">{place.name}</h2>
            <p>{place.body}</p>
            <p>
              <a href={place.url} target="_blank" rel="noopener noreferrer">
                Official visitor information ↗
              </a>
            </p>
            <button className="primary" onClick={() => toggleSave(place.id)}>
              {saved.includes(place.id)
                ? "Saved to my trip ♥"
                : "Save to my trip ♡"}
            </button>
          </>
        ) : null}
        {modal?.kind === "trip" ? (
          <>
            <div className="eyebrow">YOUR CITY STORY</div>
            <h2 id="dialog-title">My Budapest trip</h2>
            <p>Your personal shortlist, saved in this browser.</p>
            {saved.length ? (
              <>
                {saved.map((id) => {
                  const p = places.find((p) => p.id === id)!;
                  return (
                    <div className="triprow" key={id}>
                      <span>{p.name}</span>
                      <button onClick={() => setModal({ kind: "place", id })}>
                        Details ↗
                      </button>
                      <button
                        aria-label={`Remove ${p.name}`}
                        onClick={() => toggleSave(id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button className="primary" onClick={download}>
                  Download my trip ↓
                </button>
              </>
            ) : (
              <>
                <p>
                  No places saved yet. Tap the heart on a discovery to start
                  your list.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setModal(null);
                    document.getElementById("explore")?.scrollIntoView();
                  }}
                >
                  Explore places ↗
                </button>
              </>
            )}
          </>
        ) : null}
        {exp ? (
          <>
            <div className="eyebrow">THE BUDAPEST EDIT</div>
            <h2 id="dialog-title">{exp[0]}</h2>
            <p>{exp[1]}</p>
            {exp[2] ? (
              <button
                className="primary"
                onClick={() => setModal({ kind: "place", id: exp[2]! })}
              >
                Explore the place ↗
              </button>
            ) : (
              <a
                href="https://www.budapestinfo.hu/en"
                target="_blank"
                rel="noopener noreferrer"
              >
                Official city information ↗
              </a>
            )}
          </>
        ) : null}
        {modal?.kind === "district" ? (
          <>
            <div className="eyebrow">FIND YOUR NEIGHBOURHOOD</div>
            <h2 id="dialog-title">
              {modal.id === "buda" ? "The Castle District" : "Downtown Pest"}
            </h2>
            <p>
              {modal.id === "buda"
                ? "Storybook streets, courtyards and viewpoints above the Danube. Start around Matthias Church and Fisherman’s Bastion, then take time to explore Castle Hill."
                : "Stay close to the river for grand architecture and sightseeing walks. Start at Parliament, explore downtown streets and pause at a café before continuing along the Danube."}
            </p>
            <button
              className="primary"
              onClick={() =>
                setModal({
                  kind: "place",
                  id: modal.id === "buda" ? "castle" : "parliament",
                })
              }
            >
              Explore the neighbourhood ↗
            </button>
          </>
        ) : null}
        {modal?.kind === "privacy" ? (
          <>
            <h2 id="dialog-title">Your privacy</h2>
            <p>
              GoToBudapest saves your shortlist in this browser’s local storage.
              This version has no analytics, advertising cookies, accounts or
              booking forms. Remove saved places in My trip or clear site data
              to delete your shortlist.
            </p>
            <p>
              External links lead to third-party sites with their own privacy
              policies. Images are served from this site. Fonts are loaded from
              Google Fonts.
            </p>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
