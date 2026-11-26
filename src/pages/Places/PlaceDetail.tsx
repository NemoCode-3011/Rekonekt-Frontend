import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import RichText from "../../components/ui/RichText";
import LazyMap from "../../features/map/LazyMap";
import type { MapMarker } from "../../features/map/types";
import { getPlaceBySlug } from "../../features/places/api";
import { useDiscovery } from "../../features/experience/discovery/discovery-context";
import {
  PLACE_CATEGORIES,
  type PlaceCategory,
  type PlaceDetail as Place,
} from "../../features/places/types";
import { getApiErrorMessage } from "../../services/api/client";

const categoryLabel = (value: PlaceCategory | null) =>
  PLACE_CATEGORIES.find((item) => item.value === value)?.label ?? null;

function PlaceHero({ place }: { place: Place }) {
  return (
    <header className="relative isolate overflow-hidden bg-deep-forest text-ivory">
      {place.cover_image_url && (
        <>
          <img src={place.cover_image_url} alt={place.cover_image_alt ?? ""} className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-ink/50" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/25 to-ink/20" />
        </>
      )}
      <div className="container flex min-h-[55svh] flex-col justify-between py-10 md:min-h-[62svh] md:py-14">
        <Link to="/explore/places" className="inline-flex w-fit items-center gap-2 text-body-s text-ivory/80 transition-colors hover:text-ivory">
          <span aria-hidden>←</span> All places
        </Link>
        <div className="max-w-4xl pt-24">
          <p className="text-label font-medium uppercase tracking-[0.2em] text-sand">
            {[categoryLabel(place.category), place.region].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 font-display text-display-m leading-[0.98]">{place.name}</h1>
          {place.cover_image_credit && <p className="mt-6 text-label text-ivory/70">Image: {place.cover_image_credit}</p>}
        </div>
      </div>
    </header>
  );
}

function RelatedLinks({ place }: { place: Place }) {
  const { openRef } = useDiscovery();
  const hasRelated = place.events.length > 0 || place.artifacts.length > 0;
  if (!hasRelated) return null;

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="place-related-heading">
      <p className="text-label uppercase tracking-[0.16em] text-ochre-deep">Connected history</p>
      <h2 id="place-related-heading" className="mt-2 font-display text-heading-l">Stories tied to this place</h2>
      {place.events.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-heading-m">Events</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {place.events.map((event) => (
              <li key={event.id}>
                <Link to={`/events/${event.id}`} className="group flex items-center justify-between gap-6 py-5">
                  <span>
                    <span className="block font-display text-heading-s transition-colors group-hover:text-heritage-green">{event.title}</span>
                    {event.date_display && <span className="mt-1 block text-body-s text-muted">{event.date_display}</span>}
                  </span>
                  <span aria-hidden className="text-ink/40">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {place.artifacts.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-heading-m">Artifacts</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {place.artifacts.map((artifact) => (
              <li key={artifact.id} className="flex items-center justify-between gap-6 py-5">
                <span>
                  <button type="button" onClick={() => void openRef({ kind: "artifact", slug: artifact.slug })} className="text-left font-display text-heading-s transition-colors hover:text-heritage-green">{artifact.title}</button>
                  <span className="mt-1 block text-body-s text-muted">{[artifact.artifact_type, artifact.date_display].filter(Boolean).join(" · ")}</span>
                </span>
                <span aria-hidden className="text-ink/40">↗</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function PlaceDetail() {
  const { slug = "" } = useParams();
  const [state, setState] = useState<
    | { slug: string; status: "ready"; place: Place }
    | { slug: string; status: "not-found" }
    | { slug: string; status: "error"; message: string }
    | null
  >(null);
  const currentState = state?.slug === slug ? state : null;

  useEffect(() => {
    let cancelled = false;
    getPlaceBySlug(slug)
      .then((place) => { if (!cancelled) setState({ slug, status: "ready", place }); })
      .catch((error: unknown) => {
        if (cancelled) return;
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) setState({ slug, status: "not-found" });
        else setState({ slug, status: "error", message: getApiErrorMessage(error, "We couldn't load this place.") });
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (currentState?.status !== "ready") return;
    const previous = document.title;
    document.title = `${currentState.place.name} — REKÒ`;
    return () => { document.title = previous; };
  }, [currentState]);

  if (!currentState) return <div className="min-h-[60svh] bg-ivory py-20"><PageLoader /></div>;
  if (currentState.status === "not-found") return <div className="container py-24"><PageError message="This place could not be found." /><ArrowLink to="/explore/places" className="mt-8 text-heritage-green">Browse all places</ArrowLink></div>;
  if (currentState.status === "error") return <div className="container py-24"><PageError message={currentState.message} /><ArrowLink to="/explore/places" className="mt-8 text-heritage-green">Back to places</ArrowLink></div>;

  const { place } = currentState;
  const latitude = place.latitude === null ? null : Number(place.latitude);
  const longitude = place.longitude === null ? null : Number(place.longitude);
  const hasPin = latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const marker: MapMarker[] = hasPin ? [{ id: String(place.id), latitude, longitude, label: place.name }] : [];
  const nearby = place.nearby.filter((item) => item.slug !== place.slug);

  return (
    <article className="bg-ivory text-ink">
      <PlaceHero place={place} />
      <div className="container py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-20">
          <div className="max-w-reading">
            {place.summary && <p className="font-display text-heading-s leading-snug">{place.summary}</p>}
            {place.description?.trim() ? (
              <RichText html={place.description} className={`text-body-m leading-[1.8] text-ink/80 ${place.summary ? "mt-8" : ""}`} />
            ) : !place.summary ? (
              <p className="text-body-l text-muted">More about this place is on its way.</p>
            ) : null}
            <RelatedLinks place={place} />
          </div>
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border-t-2 border-ochre bg-sand/30 p-6">
              <h2 className="text-label font-medium uppercase tracking-[0.2em] text-ochre-deep">At a glance</h2>
              <dl className="mt-5 space-y-4 font-sans text-body-s">
                {categoryLabel(place.category) && <div><dt className="text-meta text-muted">Type</dt><dd className="mt-0.5">{categoryLabel(place.category)}</dd></div>}
                {place.region && <div><dt className="text-meta text-muted">Region</dt><dd className="mt-0.5">{place.region}</dd></div>}
              </dl>
              {hasPin && <a href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-body-s font-medium text-heritage-green underline underline-offset-4">Open in OpenStreetMap</a>}
            </div>
          </aside>
        </div>

        {marker.length > 0 && (
          <section className="mt-16 border-t border-line pt-10" aria-labelledby="place-map-heading">
            <p className="text-label uppercase tracking-[0.16em] text-ochre-deep">Find it</p>
            <h2 id="place-map-heading" className="mt-2 font-display text-heading-l">Where it is</h2>
            <LazyMap markers={marker} label={`Map showing ${place.name}`} className="mt-6 h-88 w-full border border-line sm:h-120" />
          </section>
        )}

        {nearby.length > 0 && (
          <section className="mt-16 border-t border-line pt-10" aria-labelledby="nearby-heading">
            <p className="text-label uppercase tracking-[0.16em] text-ochre-deep">Continue exploring</p>
            <h2 id="nearby-heading" className="mt-2 font-display text-heading-l">Nearby places</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.map((item) => (
                <Link key={item.id} to={`/places/${item.slug}`} className="group block">
                  <div className="aspect-4/3 overflow-hidden bg-sand/40">
                    {item.cover_image_url ? <img src={item.cover_image_url} alt={item.cover_image_alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center font-display text-display-m text-ink/20">{item.name.charAt(0)}</div>}
                  </div>
                  <p className="mt-4 text-meta text-ochre-deep">{item.distance_km} km away</p>
                  <h3 className="mt-1 font-display text-heading-s group-hover:text-heritage-green">{item.name}</h3>
                  {item.region && <p className="mt-1 text-body-s text-muted">{item.region}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="mt-16 border-t border-line pt-10">
          <ArrowLink to="/explore/places" className="text-heritage-green">Back to all places</ArrowLink>
        </div>
      </div>
    </article>
  );
}
