"use client";
import { useEffect, useState } from "react";
import { savedPlaces } from "../lib/content";
const key = "gotobudapest-trip";
const legacy: Record<string, string> = {
  bastion: "fishermans-bastion",
  parliament: "hungarian-parliament",
  szechenyi: "szechenyi-thermal-bath",
  matthias: "matthias-church",
  castle: "buda-castle-district",
};
export function useSavedTrip() {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(value))
        setSaved([
          ...new Set(
            value
              .filter((id): id is string => typeof id === "string")
              .map((id) => legacy[id] || id)
              .filter((id) => savedPlaces.some((p) => p.id === id)),
          ),
        ]);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(saved));
      } catch {}
  }, [saved, ready]);
  function toggleSave(id: string) {
    setSaved((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }
  return { saved, toggleSave };
}
