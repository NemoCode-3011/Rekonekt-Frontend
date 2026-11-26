import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import LazyMap from "../../features/map/LazyMap";
import type { MapMarker } from "../../features/map/types";
import { getPlaceFacets, listPlaces } from "../../features/places/api";
import {
  PLACE_CATEGORIES,
  type PlaceCard,
  type PlaceCategory,
  type PlaceFacets,
  type PlaceRegion,
} from "../../features/places/types";
import { getApiErrorMessage } from "../../services/api/client";

const categoryLabel = (value: PlaceCategory | null) =>
  PLACE_CATEGORIES.find((item) => item.value === value)?.label ?? "Place";

const numberCoordinate = (value: string | number | null) => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function PlaceImage({ place, className = "" }: { place: PlaceCard; className?: string }) {
  return place.cover_image_url ? (
    <img
      src={place.cover_image_url}
      alt={place.cover_image_alt ?? ""}
      loading="lazy"
      className={`h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03] ${className}`}
    />
  ) : (
    <div className={`grid h-full w-full place-items-center bg-sand/50 ${className}`}>
      <span aria-hidden className="font-display text-display-m text-ink/20">
        {place.name.charAt(0)}
      </span>
    </div>
  );
}

function PlaceCardView({ place, selected = false }: { place: PlaceCard; selected?: boolean }) {
  return (
    <article className={selected ? "-m-3 border border-heritage-green/40 bg-sand/20 p-3" : ""}>
      <Link to={`/places/${place.slug}`} className="group block">
        <div className="aspect-4/3 overflow-hidden bg-sand/40">
          <PlaceImage place={place} />
        </div>
        <p className="mt-5 text-meta uppercase tracking-widest text-ochre-deep">
          {[categoryLabel(place.category), place.region].filter(Boolean).join(" · ")}
        </p>
        <h2 className="mt-1 font-display text-heading-m leading-tight transition-colors group-hover:text-heritage-green">
          {place.name}
        </h2>
        {place.summary && (
          <p className="mt-3 line-clamp-3 font-sans text-body-m text-muted">
            {place.summary}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-body-s font-medium text-heritage-green">
          Explore place <span aria-hidden>→</span>
        </span>
      </Link>
      {place.cover_image_credit && (
        <p className="mt-2 font-sans text-meta text-muted">Image: {place.cover_image_credit}</p>
      )}
    </article>
  );
}

type LoadState =
  | { requestKey: string; status: "ready"; places: PlaceCard[]; facets: PlaceFacets }
  | { requestKey: string; status: "error"; message: string };

const EMPTY_PLACES: PlaceCard[] = [];

export default function Places() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<LoadState | null>(null);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const region = params.get("region") ?? "";
  const category = params.get("category") ?? "";
  const searchQuery = params.get("q") ?? "";
  const requestKey = `${region}\u0000${category}\u0000${searchQuery}`;
  const currentState = state?.requestKey === requestKey ? state : null;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listPlaces({
        region: (region || undefined) as PlaceRegion | undefined,
        category: (category || undefined) as PlaceCategory | undefined,
        q: searchQuery || undefined,
      }),
      getPlaceFacets(),
    ])
      .then(([places, facets]) => {
        if (!cancelled) setState({ requestKey, status: "ready", places, facets });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ requestKey, status: "error", message: getApiErrorMessage(error, "We couldn't load places.") });
        }
      });
    return () => { cancelled = true; };
  }, [requestKey, region, category, searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, params, setParams]);

  const places = currentState?.status === "ready" ? currentState.places : EMPTY_PLACES;
  const markers = useMemo<MapMarker[]>(() => places.flatMap((place) => {
    const latitude = numberCoordinate(place.latitude);
    const longitude = numberCoordinate(place.longitude);
    return latitude === null || longitude === null
      ? []
      : [{ id: String(place.id), latitude, longitude, label: place.name }];
  }), [places]);

  const updateFilter = (key: "region" | "category", value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <main className="bg-ivory text-ink">
      <header className="border-b border-line">
        <div className="container py-24 md:py-32">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-ochre-deep">EXPLORE PLACES</p>
            <h1 className="mt-6 max-w-4xl font-display text-display-l leading-[0.92]">Where history happened.</h1>
            <p className="mt-8 max-w-2xl text-body-l text-muted">
              Explore the cities, sacred sites, palaces and landscapes that hold Nigeria's stories.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-[minmax(14rem,1fr)_minmax(12rem,0.7fr)_minmax(12rem,0.7fr)]">
            <label className="block">
              <span className="mb-2 block text-label text-muted">Search places</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, summary or region"
                className="h-12 w-full border border-line bg-transparent px-4 text-body-m focus:border-heritage-green focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-label text-muted">Region</span>
              <select value={region} onChange={(event) => updateFilter("region", event.target.value)} className="h-12 w-full border border-line bg-ivory px-4 text-body-m focus:border-heritage-green focus:outline-none">
                <option value="">All regions</option>
                {currentState?.status === "ready" && currentState.facets.regions.map((item) => (
                  <option key={item.value} value={item.value}>{item.value} ({item.count})</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-label text-muted">Place type</span>
              <select value={category} onChange={(event) => updateFilter("category", event.target.value)} className="h-12 w-full border border-line bg-ivory px-4 text-body-m focus:border-heritage-green focus:outline-none">
                <option value="">All types</option>
                {currentState?.status === "ready" && currentState.facets.categories.map((item) => (
                  <option key={item.value} value={item.value}>{categoryLabel(item.value)} ({item.count})</option>
                ))}
              </select>
            </label>
          </div>

          {!currentState && <div className="py-16"><PageLoader /></div>}
          {currentState?.status === "error" && <div className="py-12"><PageError message={currentState.message} /></div>}
          {currentState?.status === "ready" && (
            <>
              <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-body-s text-muted">
                  Showing <strong className="text-ink">{places.length}</strong> of {currentState.facets.total} published places
                </p>
                {(region || category || query) && (
                  <button type="button" onClick={() => { setQuery(""); setParams({}); }} className="text-body-s text-heritage-green underline underline-offset-4">
                    Clear filters
                  </button>
                )}
              </div>

              {markers.length > 0 && (
                <section aria-labelledby="places-map-heading" className="mt-8">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-label uppercase tracking-[0.16em] text-ochre-deep">Find your way</p>
                      <h2 id="places-map-heading" className="mt-1 font-display text-heading-m">Places on the map</h2>
                    </div>
                    <p className="text-meta text-muted">Select a pin to identify a place.</p>
                  </div>
                  <LazyMap markers={markers} selectedId={selectedPlaceId} onSelect={setSelectedPlaceId} label="Map of published places in Nigeria" className="h-88 w-full border border-line sm:h-120" />
                </section>
              )}

              {places.length === 0 ? (
                <p className="py-16 text-body-m text-muted">No places match those filters. Try another search or clear your filters.</p>
              ) : (
                <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((place) => <PlaceCardView key={place.id} place={place} selected={String(place.id) === selectedPlaceId} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
