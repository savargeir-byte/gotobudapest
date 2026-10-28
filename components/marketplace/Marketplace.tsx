"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import "../marketplace.css";
import ProductCard from "./ProductCard";
import { parseQuery } from "@/lib/marketplace/query";
import {
  CATEGORIES,
  DURATIONS,
  PROVIDERS,
  PROVIDER_LABEL,
  SORT_LABEL,
  type MarketplaceProduct,
  type MarketplaceQuery,
  type MarketplaceResult,
  type Provider,
  type SortKey,
} from "@/lib/marketplace/types";
import {
  activeFilterCount,
  allProvidersDown,
  apiUrl,
  capabilityNote,
  countLine,
  createRequestGate,
  degradedProviders,
  filterChips,
  mergeItems,
  pageUrl,
  visibleControls,
  withoutChip,
} from "@/lib/marketplace/ui";

const MOBILE_QUERY = "(max-width: 959px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const mobileNow = () => window.matchMedia(MOBILE_QUERY).matches;

type Phase = "idle" | "loading" | "error";
const DEBOUNCE_MS = 350;
const isPlainClick = (e: React.MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

function Skeletons({ count = 6 }: { count?: number }) {
  return (
    <ul className="mk-grid" aria-hidden="true" data-testid="mk-skeleton">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="mk-skel">
            <i className="mk-skel-img" />
            <div className="mk-skel-body">
              <i className="mk-skel-line short" />
              <i className="mk-skel-line" />
              <i className="mk-skel-line" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// The searchable, filterable, paginated marketplace. The server renders the first page of
// results from the URL (so it works without JavaScript and every search is shareable); with
// JavaScript the same controls refetch /api/marketplace/search, update the URL, cancel
// superseded requests and ignore stale responses. The cursor is never put in the URL.
export default function Marketplace({
  initialQuery,
  initialResult,
}: {
  initialQuery: MarketplaceQuery;
  initialResult: MarketplaceResult | null;
}) {
  const [query, setQuery] = useState<MarketplaceQuery>({ ...initialQuery, cursor: undefined });
  const [items, setItems] = useState<MarketplaceProduct[]>(initialResult?.items ?? []);
  const [result, setResult] = useState<MarketplaceResult | null>(initialResult);
  const [cursor, setCursor] = useState<string | undefined>(initialResult?.nextCursor);
  const [phase, setPhase] = useState<Phase>(initialResult ? "idle" : "error");
  const [moreState, setMoreState] = useState<"idle" | "loading" | "error">("idle");
  const [announce, setAnnounce] = useState("");
  const [draft, setDraft] = useState(initialQuery.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribeMobile, mobileNow, () => false);

  const gate = useRef(createRequestGate());
  const abort = useRef<AbortController | null>(null);
  const moreInFlight = useRef(false);
  const queryRef = useRef(query);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLFormElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const controls = useMemo(() => visibleControls(query.provider), [query.provider]);

  // ---------------------------------------------------------------- searching
  const run = useCallback(async (next: MarketplaceQuery, history: "push" | "replace" | "none") => {
    const clean: MarketplaceQuery = { ...next, cursor: undefined };
    if (debounce.current) clearTimeout(debounce.current);
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const id = gate.current.next();
    moreInFlight.current = false;
    setQuery(clean);
    setDraft(clean.q ?? "");
    setPhase("loading");
    setMoreState("idle");
    if (history !== "none") {
      const url = pageUrl(clean);
      if (history === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    }
    try {
      const res = await fetch(apiUrl(clean), { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as MarketplaceResult;
      if (!gate.current.isCurrent(id)) return; // a newer search owns the page
      if (!body || !Array.isArray(body.items)) throw new Error("bad response");
      setResult(body);
      setItems(mergeItems([], body.items));
      setCursor(body.nextCursor);
      setPhase("idle");
      setAnnounce(`${body.items.length} results`);
    } catch (e) {
      if (controller.signal.aborted || !gate.current.isCurrent(id)) return;
      void e;
      setResult(null);
      setItems([]);
      setCursor(undefined);
      setPhase("error");
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || moreInFlight.current || phase === "loading") return;
    moreInFlight.current = true;
    setMoreState("loading");
    const snapshot = queryRef.current;
    const controller = new AbortController();
    abort.current?.abort();
    abort.current = controller;
    const id = gate.current.next();
    try {
      const res = await fetch(apiUrl(snapshot, cursor), { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as MarketplaceResult;
      if (!gate.current.isCurrent(id)) return;
      if (!body || !Array.isArray(body.items)) throw new Error("bad response");
      setItems((cur) => {
        const merged = mergeItems(cur, body.items);
        setAnnounce(`${merged.length - cur.length} more results loaded`);
        return merged;
      });
      setResult((r) => (r ? { ...body, items: r.items } : body));
      setCursor(body.nextCursor);
      setMoreState("idle");
    } catch {
      if (controller.signal.aborted || !gate.current.isCurrent(id)) return;
      setMoreState("error");
    } finally {
      moreInFlight.current = false;
    }
  }, [cursor, phase]);

  // Back / forward: re-run the search the URL describes (no new history entry).
  useEffect(() => {
    const onPop = () => void run(parseQuery(new URLSearchParams(window.location.search)), "none");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [run]);

  useEffect(
    () => () => {
      abort.current?.abort();
      if (debounce.current) clearTimeout(debounce.current);
    },
    [],
  );

  // ---------------------------------------------------------------- form handling
  const fromForm = useCallback((): MarketplaceQuery => {
    const form = formRef.current;
    const data = form ? new FormData(form) : new FormData();
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) if (typeof v === "string" && v !== "") params.set(k, v);
    // The category is chosen with the tabs, not the form: keep the current one.
    if (queryRef.current.category) params.set("category", queryRef.current.category);
    return parseQuery(params);
  }, []);

  const scheduleFromForm = () => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void run(fromForm(), "replace"), DEBOUNCE_MS);
  };

  const closeDrawer = useCallback(() => {
    setFiltersOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  // Accessible drawer on small screens: Esc closes, Tab stays inside, focus returns.
  useEffect(() => {
    if (!filtersOpen || !mobile) return;
    const root = drawerRef.current;
    const focusables = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])") ?? [],
      ).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      } else if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtersOpen, mobile, closeDrawer]);

  // ---------------------------------------------------------------- derived view
  const chips = filterChips(query);
  const filterCount = activeFilterCount(query);
  const degraded = result ? degradedProviders(result, query) : [];
  const down = result ? allProvidersDown(result, query) : false;
  const hasQueryFilters = chips.some((c) => c.key !== "sort");
  const link = (patch: Partial<MarketplaceQuery>): MarketplaceQuery => ({ ...query, cursor: undefined, ...patch });
  const clearFilters: MarketplaceQuery = {
    ...query, cursor: undefined, provider: undefined, priceMin: undefined, priceMax: undefined,
    duration: undefined, minRating: undefined, sort: "relevance",
  };
  const everything: MarketplaceQuery = { sort: "relevance" };

  const nav = (target: MarketplaceQuery) => (e: React.MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    void run(target, "push");
    setFiltersOpen(false);
  };

  const noteFor = (key: "price" | "duration" | "rating" | "sort") => capabilityNote(key, query.provider);
  const sortNote = noteFor("sort");

  return (
    <div className="mk-app" data-phase={phase}>
      <noscript>
        <style>{`@media (max-width: 959px){.mk-filters{display:block !important;position:static !important;max-height:none !important}.mk-filter-toggle{display:none !important}}`}</style>
      </noscript>

      <form
        className="mk-searchbar"
        role="search"
        method="get"
        action="/tours"
        onSubmit={(e) => {
          e.preventDefault();
          void run({ ...query, q: draft.trim() || undefined, cursor: undefined }, "push");
        }}
      >
        <label htmlFor="mk-q">Search Budapest tours and tickets</label>
        <input
          id="mk-q"
          type="search"
          name="q"
          value={draft}
          maxLength={80}
          placeholder="Search tours, cruises, baths, tickets…"
          autoComplete="off"
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            if (debounce.current) clearTimeout(debounce.current);
            debounce.current = setTimeout(
              () => void run({ ...queryRef.current, q: v.trim() || undefined, cursor: undefined }, "replace"),
              DEBOUNCE_MS,
            );
          }}
        />
        {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
        {query.provider ? <input type="hidden" name="provider" value={query.provider} /> : null}
        <button type="submit">Search</button>
      </form>

      <div className="mk-tabs" role="navigation" aria-label="Tour categories">
        <a
          href={pageUrl({ ...query, category: undefined, cursor: undefined })}
          aria-current={!query.category ? "page" : undefined}
          onClick={nav(link({ category: undefined }))}
        >
          All
        </a>
        {CATEGORIES.map((c) => (
          <a
            key={c.key}
            href={pageUrl({ ...query, category: c.key, cursor: undefined })}
            aria-current={query.category === c.key ? "page" : undefined}
            onClick={nav(link({ category: c.key }))}
          >
            {c.label}
          </a>
        ))}
      </div>
      <p className="mk-help">
        Categories are matched on product titles and Viator tags, not on a provider-wide category list.
      </p>

      <div className="mk-layout">
        <div>
          <button
            ref={triggerRef}
            type="button"
            className="mk-filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="mk-filter-panel"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filters &amp; sort{filterCount ? ` (${filterCount})` : ""}
          </button>
          <div className={`mk-overlay${filtersOpen ? " open" : ""}`} onClick={closeDrawer} aria-hidden="true" />
          <form
            id="mk-filter-panel"
            ref={(el) => {
              formRef.current = el;
              drawerRef.current = el;
            }}
            className={`mk-filters${filtersOpen ? " open" : ""}`}
            method="get"
            action="/tours"
            role={mobile && filtersOpen ? "dialog" : undefined}
            aria-modal={mobile && filtersOpen ? true : undefined}
            aria-label="Filters and sorting"
            onSubmit={(e) => {
              e.preventDefault();
              void run(fromForm(), "push");
              if (mobile) closeDrawer();
            }}
            onChange={(e) => {
              const t = e.target as HTMLElement;
              if (t instanceof HTMLInputElement && t.type === "number") scheduleFromForm();
              else void run(fromForm(), "push");
            }}
          >
            <button type="button" className="mk-drawer-close" aria-label="Close filters" onClick={closeDrawer}>
              ×
            </button>
            <h2>Filters</h2>
            {/* Free text and category live outside the panel; keep them in the GET form. */}
            <input type="hidden" name="q" value={query.q ?? ""} />

            <fieldset>
              <legend>Provider</legend>
              {[undefined, ...PROVIDERS].map((p) => (
                <label className="mk-radio" key={p ?? "all"}>
                  <input type="radio" name="provider" value={p ?? ""} defaultChecked={(query.provider ?? undefined) === p} key={`${p}-${query.provider ?? "all"}`} />
                  {p ? PROVIDER_LABEL[p as Provider] : "All providers"}
                </label>
              ))}
            </fieldset>

            {controls.price ? (
              <fieldset>
                <legend>Price (EUR)</legend>
                <div className="mk-price">
                  <label>
                    Min
                    <input type="number" name="priceMin" inputMode="decimal" min={0} max={5000} step="1" defaultValue={query.priceMin ?? ""} key={`min-${query.priceMin ?? ""}`} />
                  </label>
                  <label>
                    Max
                    <input type="number" name="priceMax" inputMode="decimal" min={0} max={5000} step="1" defaultValue={query.priceMax ?? ""} key={`max-${query.priceMax ?? ""}`} />
                  </label>
                </div>
                {noteFor("price") ? <p className="mk-note">{noteFor("price")}</p> : null}
              </fieldset>
            ) : null}

            {controls.duration ? (
              <fieldset>
                <label className="mk-label" htmlFor="mk-duration">Duration</label>
                <select id="mk-duration" name="duration" defaultValue={query.duration ?? ""} key={`d-${query.duration ?? ""}`}>
                  <option value="">Any duration</option>
                  {DURATIONS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {noteFor("duration") ? <p className="mk-note">{noteFor("duration")}</p> : null}
              </fieldset>
            ) : null}

            {controls.rating ? (
              <fieldset>
                <label className="mk-label" htmlFor="mk-rating">Minimum rating</label>
                <select id="mk-rating" name="rating" defaultValue={query.minRating ? String(query.minRating) : ""} key={`r-${query.minRating ?? ""}`}>
                  <option value="">Any rating</option>
                  <option value="4">4★ and up</option>
                  <option value="4.5">4.5★ and up</option>
                </select>
                {noteFor("rating") ? <p className="mk-note">{noteFor("rating")}</p> : null}
              </fieldset>
            ) : null}

            <fieldset>
              <label className="mk-label" htmlFor="mk-sort">Sort by</label>
              <select id="mk-sort" name="sort" defaultValue={query.sort} key={`s-${query.sort}-${query.provider ?? ""}`}>
                {controls.sorts.map((s: SortKey) => (
                  <option key={s} value={s}>
                    {SORT_LABEL[s]}
                  </option>
                ))}
              </select>
              {sortNote ? <p className="mk-note">{sortNote}</p> : null}
            </fieldset>

            <div className="mk-filter-actions">
              {/* Applies immediately with JavaScript; submits the GET form without it. */}
              <button type="submit" className="primary">
                Apply filters
              </button>
              {filterCount ? (
                <a className="outline" href={pageUrl(clearFilters)} onClick={nav(clearFilters)}>
                  Clear filters
                </a>
              ) : null}
            </div>
          </form>
        </div>

        <div ref={resultsRef} aria-busy={phase === "loading"} {...(mobile && filtersOpen ? { inert: true } : {})}>
          <div className="mk-toolbar">
            <p className="mk-count" role="status">
              {phase === "loading" ? "Searching…" : result ? countLine(result, query, items.length) : ""}
            </p>
            {filterCount ? (
              <a className="outline mk-clear-mobile" href={pageUrl(clearFilters)} onClick={nav(clearFilters)}>
                Clear filters
              </a>
            ) : null}
          </div>

          {chips.length ? (
            <ul className="mk-chips" aria-label="Active filters">
              {chips.map((c) => {
                const target = withoutChip(query, c);
                return (
                  <li key={c.key}>
                    <a href={pageUrl(target)} onClick={nav(target)} aria-label={`Remove filter: ${c.label}`}>
                      {c.label} <span aria-hidden="true">×</span>
                    </a>
                  </li>
                );
              })}
              {hasQueryFilters ? (
                <li>
                  <a className="mk-clear" href={pageUrl(everything)} onClick={nav(everything)}>
                    Clear all
                  </a>
                </li>
              ) : null}
            </ul>
          ) : null}

          {(down ? [] : degraded).map((d) => (
            <p className="mk-status" role="status" key={d.provider} data-provider-status={d.provider}>
              {d.text}
            </p>
          ))}
          {result?.notes?.length && phase !== "loading" ? (
            <ul className="mk-notes">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}

          {phase === "loading" ? (
            <Skeletons />
          ) : phase === "error" || down ? (
            <div className="mk-empty" role="alert">
              {query.provider ? (
                <>
                  <h2>{PROVIDER_LABEL[query.provider]} tours are temporarily unavailable</h2>
                  <p>
                    We could not load {PROVIDER_LABEL[query.provider]} products just now. The other providers are not
                    affected.
                  </p>
                </>
              ) : (
                <>
                  <h2>Tours are temporarily unavailable</h2>
                  <p>We could not load the tour catalogue just now. Please try again in a moment.</p>
                </>
              )}
              <div className="mk-actions">
                <button type="button" className="primary" onClick={() => void run(query, "none")}>
                  Retry
                </button>
                {query.provider ? (
                  <a className="outline" href={pageUrl(everything)} onClick={nav(everything)}>
                    Show all providers
                  </a>
                ) : null}
                <Link className="outline" href="/guides">
                  Read the guides meanwhile
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="mk-empty" data-testid="mk-empty">
              <h2>No tours match your search</h2>
              <p>
                {hasQueryFilters
                  ? "Try removing a filter or searching for something broader."
                  : "No Budapest products were returned by our providers right now."}
              </p>
              <div className="mk-actions">
                {hasQueryFilters ? (
                  <a className="primary" href={pageUrl(everything)} onClick={nav(everything)}>
                    Clear filters
                  </a>
                ) : null}
                {CATEGORIES.slice(0, 4).map((c) => (
                  <a key={c.key} className="outline" href={pageUrl({ sort: "relevance", category: c.key })} onClick={nav({ sort: "relevance", category: c.key })}>
                    {c.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <ul className="mk-grid" aria-label="Tours and tickets">
              {items.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 3} />
                </li>
              ))}
            </ul>
          )}

          {phase !== "loading" && cursor && items.length > 0 ? (
            <div className="mk-more">
              {moreState === "error" ? (
                <p className="mk-status" role="alert">
                  More results could not be loaded.
                </p>
              ) : null}
              <button type="button" className="primary" onClick={() => void loadMore()} disabled={moreState === "loading"} aria-busy={moreState === "loading"}>
                {moreState === "loading" ? "Loading…" : moreState === "error" ? "Try again" : "Load more tours"}
              </button>
              {/* Without JavaScript the same page is reachable through the filters; no cursor in URLs. */}
            </div>
          ) : null}
          <p className="sr" role="status" aria-live="polite">
            {announce}
          </p>
        </div>
      </div>
    </div>
  );
}
