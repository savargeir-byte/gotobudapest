"use client";
import { useSavedTrip } from "../hooks/use-saved-trip";
export default function SavePlace({ id }: { id: string }) {
  const { saved, toggleSave } = useSavedTrip();
  return (
    <button
      className="primary"
      aria-pressed={saved.includes(id)}
      onClick={() => toggleSave(id)}
    >
      {saved.includes(id) ? "Saved to my trip ♥" : "Save to my trip ♡"}
    </button>
  );
}
