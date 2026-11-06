"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { activityOrder, describeWeather } from "@/lib/weather";

type Weather = {
  city: string; date: string; current: number; max: number; min: number;
  code: number | null; isDay?: boolean; sunset: string | null; source: string; updated: string | null;
};
type State = { status: "loading" } | { status: "ok"; weather: Weather } | { status: "error" };

// Live Budapest forecast from Open-Meteo, fetched through our cached route (/api/weather/budapest): the visitor's
// location is never requested. A failed lookup shows a plain unavailable note, never a stale or invented number.
export default function BudapestWeatherBanner() {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/weather/budapest", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Unavailable"))))
      .then((payload: Weather) => {
        if (controller.signal.aborted) return;
        setState(Number.isFinite(payload?.current) ? { status: "ok", weather: payload } : { status: "error" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);
  const weather = state.status === "ok" ? state.weather : null;
  const condition = weather ? describeWeather(weather.code, weather.isDay ?? true) : null;
  const bathsFirst = weather ? activityOrder(weather.current, weather.code) === "baths-first" : false;
  const links = bathsFirst
    ? [{ href: "/experiences/thermal-baths", label: "Thermal baths" }, { href: "/experiences/danube", label: "Explore the Danube" }]
    : [{ href: "/experiences/danube", label: "Explore the Danube" }, { href: "/experiences/thermal-baths", label: "Thermal baths" }];
  return (
    <section className="budapest-weather-banner section" aria-label="Weather in Budapest today">
      <div className="budapest-weather-content" data-state={state.status}>
        <div>
          <div className="eyebrow">PLAN YOUR DAY IN BUDAPEST</div>
          <h2>Budapest weather today</h2>
          {weather ? (
            <p>
              <span className="budapest-weather-symbol" aria-hidden="true">{condition?.icon}</span> {condition?.label} · {weather.max}° high / {weather.min}° low
            </p>
          ) : state.status === "error" ? (
            <p>The forecast is unavailable right now. Plan a day by the river or discover indoor experiences.</p>
          ) : (
            <p>Loading today&apos;s Budapest forecast…</p>
          )}
        </div>
        {weather ? (
          <div className="budapest-weather-current">
            <span className="sr">Current temperature {weather.current} degrees Celsius</span>
            <span aria-hidden="true">{weather.current}°<small>C</small></span>
          </div>
        ) : null}
        <div className="budapest-weather-actions">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="textlink">{l.label} ↗</Link>
          ))}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="budapest-weather-source">
            Weather data: Open-Meteo ↗
          </a>
        </div>
      </div>
    </section>
  );
}
