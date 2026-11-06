"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Weather = {
  city: string; date: string; current: number; max: number; min: number;
  code: number; sunset: string | null; source: string; updated: string | null;
};
const conditions = (code: number) => {
  if (code === 0) return { icon: "☀️", label: "Clear skies" };
  if (code <= 3) return { icon: "⛅", label: "Partly cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", label: "Rain or drizzle" };
  if (code >= 71 && code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Showers" };
  if (code >= 95) return { icon: "⛈️", label: "Thunderstorms" };
  return { icon: "☁️", label: "Cloudy" };
};

export default function BudapestWeatherBanner() {
  const [weather, setWeather] = useState<Weather | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/weather/budapest", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
      .then((payload: Weather) => { if (!controller.signal.aborted && Number.isFinite(payload.current)) setWeather(payload); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const condition = weather ? conditions(weather.code) : null;
  return (
    <section className="budapest-weather-banner section" aria-label="Weather in Budapest today">
      <div className="budapest-weather-content">
        <div>
          <div className="eyebrow">PLAN YOUR DAY IN BUDAPEST</div>
          <h2>Budapest weather today</h2>
          {weather ? (
            <p><span className="budapest-weather-symbol" aria-hidden="true">{condition?.icon}</span> {condition?.label} · {weather.max}° high / {weather.min}° low</p>
          ) : <p>Checking today&apos;s Budapest forecast. Plan a day by the river or discover indoor experiences.</p>}
        </div>
        {weather ? <div className="budapest-weather-current" aria-label={`Current temperature ${weather.current} degrees Celsius`}>{weather.current}°<small>C</small></div> : null}
        <div className="budapest-weather-actions">
          <Link href="/experiences/danube" className="textlink">Explore the Danube ↗</Link>
          <Link href="/experiences/thermal-baths" className="textlink">Thermal baths ↗</Link>
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="budapest-weather-source">Weather: Open-Meteo · Updated forecast ↗</a>
        </div>
      </div>
    </section>
  );
}
