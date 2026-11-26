import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import LazyMap from "../../features/map/LazyMap";
import type { MapMarker } from "../../features/map/types";
import { getWonders } from "../../features/wonders/api";
import WonderCover from "../../features/wonders/WonderCover";
import {
  countOfType,
  filterByType,
  pinOf,
  typesPresent,
} from "../../features/wonders/helpers";
import {
  isWonderType,
  wonderTypeLabel,
  wonderTypePluralLabel,
  type WonderCard,
} from "../../features/wonders/types";
import { getApiErrorMessage } from "../../services/api/client";

const copy = {
  label: "HIDDEN WONDERS",
  heading: "Nigeria has secrets worth the trip.",
  intro:
    "Waterfalls tucked into hillsides, festivals that shake a whole town awake, dishes and crafts passed down for generations. Wander through the wonders you won't find in a textbook.",
  empty: "No hidden wonders have been published yet. Check back soon.",
  emptyFiltered: "No wonders of this kind yet. Try another one.",
  error: "We couldn't load the hidden wonders. Please try again in a moment.",
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; items: WonderCard[] }
  | { status: "error"; message: string };

const NO_ITEMS: WonderCard[] = [];

function WonderTile({
  item,
  featured,
}: {
  item: WonderCard;
  featured: boolean;
}) {
  const kind = wonderTypeLabel(item.wonder_type);

  return (
    <article className={featured ? "sm:col-span-2" : ""}>
      <Link to={`/wonders/${item.slug}`} className="group block">
        <div className="relative overflow-hidden bg-sand/40">
          <WonderCover
            url={item.cover_image_url}
            alt={item.cover_image_alt}
            title={item.title}
            className={`w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.03] ${
              featured ? "aspect-16/10" : "aspect-4/3"
            }`}
          />
          {kind && (
            <span className="absolute left-4 top-4 bg-ivory px-3 py-1 text-label font-medium uppercase tracking-wide text-deep-forest">
              {kind}
            </span>
          )}
        </div>

        {item.region && (
          <p className="mt-5 text-meta uppercase tracking-widest text-ochre-deep">
            {item.region}
          </p>
        )}

        <h2
          className={`mt-1 font-display leading-tight transition-colors group-hover:text-heritage-green ${
            featured ? "text-heading-l" : "text-heading-m"
          }`}
        >
          {item.title}
        </h2>

        {item.summary && (
          <p className="mt-3 line-clamp-3 font-sans text-body-m text-muted">
            {item.summary}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-2 text-body-s font-medium text-heritage-green">
          Discover
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </span>
      </Link>

      {item.cover_image_credit && (
        <p className="mt-2 font-sans text-meta text-muted">
          Image: {item.cover_image_credit}
        </p>
      )}
    </article>
  );
}

// What shows under the map once a pin is chosen.
function ChosenWonder({ item }: { item: WonderCard }) {
  const kind = wonderTypeLabel(item.wonder_type);

  return (
    <div className="mt-6 flex gap-5 border border-line bg-ivory p-4 sm:gap-6 sm:p-5">
      <WonderCover
        url={item.cover_image_url}
        alt={item.cover_image_alt}
        title={item.title}
        className="aspect-square w-24 shrink-0 sm:w-40"
      />

      <div className="min-w-0">
        <p className="text-meta uppercase tracking-widest text-ochre-deep">
          {[kind, item.region].filter(Boolean).join(" · ")}
        </p>
        <h2 className="mt-1 font-display text-heading-s leading-tight">
          {item.title}
        </h2>
        {item.summary && (
          <p className="mt-2 line-clamp-2 font-sans text-body-s text-muted">
            {item.summary}
          </p>
        )}
        <ArrowLink to={`/wonders/${item.slug}`} className="mt-4 text-heritage-green">
          Open this wonder
        </ArrowLink>
      </div>
    </div>
  );
}

export default function Wonders() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getWonders()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: getApiErrorMessage(error, copy.error),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The choices live in the address bar, so a view can be shared and the
  // back button behaves as expected.
  const typeParam = params.get("type");
  const active = isWonderType(typeParam) ? typeParam : null;
  const wantsMap = params.get("view") === "map";
  const selectedSlug = params.get("wonder");

  const items = state.status === "ready" ? state.items : NO_ITEMS;
  const available = useMemo(() => typesPresent(items), [items]);
  const shown = useMemo(() => filterByType(items, active), [items, active]);
  const pinned = useMemo(
    () =>
      shown.flatMap((item) => {
        const pin = pinOf(item);
        return pin ? [{ item, pin }] : [];
      }),
    [shown],
  );
  const markers = useMemo<MapMarker[]>(
    () =>
      pinned.map(({ item, pin }) => ({
        id: item.slug,
        latitude: pin.latitude,
        longitude: pin.longitude,
        label: item.title,
      })),
    [pinned],
  );
  const anyPins = useMemo(
    () => items.some((item) => pinOf(item) !== null),
    [items],
  );

  const showMap = wantsMap && anyPins;
  const chosen = pinned.find(({ item }) => item.slug === selectedSlug)?.item;
  // With enough wonders, the first one gets a wider, taller card.
  const featuredFirst = shown.length >= 3;

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  const chip = (selected: boolean) =>
    `border px-4 py-2 text-body-s transition-colors ${
      selected
        ? "border-heritage-green bg-heritage-green text-ivory"
        : "border-line text-ink hover:border-heritage-green"
    }`;

  return (
    <div className="bg-ivory text-ink">
      <section className="border-b border-line">
        <div className="container pb-12 pt-16 md:pb-16 md:pt-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-label font-medium tracking-[0.2em] text-ochre-deep">
              {copy.label}
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-display-m leading-[0.98]">
              {copy.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-body-l text-muted">
              {copy.intro}
            </p>
          </motion.div>

          {available.length > 1 && (
            <div
              className="mt-10 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter hidden wonders by kind"
            >
              <button
                type="button"
                onClick={() => update({ type: null, wonder: null })}
                aria-pressed={!active}
                className={chip(!active)}
              >
                All
              </button>
              {available.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update({ type, wonder: null })}
                  aria-pressed={active === type}
                  className={chip(active === type)}
                >
                  {wonderTypePluralLabel(type)}
                  <span className="ml-2 opacity-60">
                    {countOfType(items, type)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="container py-14 md:py-20">
          {state.status === "loading" && (
            <PageLoader label="Finding hidden wonders…" />
          )}
          {state.status === "error" && <PageError message={state.message} />}

          {state.status === "ready" && items.length === 0 && (
            <p className="text-body-m text-muted">{copy.empty}</p>
          )}

          {state.status === "ready" && items.length > 0 && (
            <>
              <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <p aria-live="polite" className="text-body-s text-muted">
                  {shown.length === 1
                    ? "1 hidden wonder"
                    : `${shown.length} hidden wonders`}
                </p>

                {anyPins && (
                  <div
                    className="flex gap-2"
                    role="group"
                    aria-label="How to browse"
                  >
                    <button
                      type="button"
                      onClick={() => update({ view: null })}
                      aria-pressed={!showMap}
                      className={chip(!showMap)}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ view: "map" })}
                      aria-pressed={showMap}
                      className={chip(showMap)}
                    >
                      Map
                    </button>
                  </div>
                )}
              </div>

              {shown.length === 0 && (
                <p className="text-body-m text-muted">{copy.emptyFiltered}</p>
              )}

              {shown.length > 0 && !showMap && (
                <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((item, index) => (
                    <WonderTile
                      key={item.id}
                      item={item}
                      featured={featuredFirst && index === 0}
                    />
                  ))}
                </div>
              )}

              {shown.length > 0 && showMap && pinned.length === 0 && (
                <p className="text-body-m text-muted">
                  None of these are pinned to the map. Switch to Cards to see
                  them all.
                </p>
              )}

              {shown.length > 0 && showMap && pinned.length > 0 && (
                <div>
                  <LazyMap
                    markers={markers}
                    selectedId={chosen?.slug ?? null}
                    onSelect={(id) => update({ wonder: id })}
                    reduceMotion={Boolean(reduce)}
                    label="Map of hidden wonders"
                    className="h-[60svh] min-h-96 w-full border border-line"
                  />

                  <div aria-live="polite">
                    {chosen ? (
                      <ChosenWonder item={chosen} />
                    ) : (
                      <p className="mt-6 text-body-s text-muted">
                        Choose a pin to meet the wonder.
                      </p>
                    )}
                  </div>

                  {shown.length > pinned.length && (
                    <p className="mt-6 text-body-s text-muted">
                      {shown.length - pinned.length === 1
                        ? "1 more isn't"
                        : `${shown.length - pinned.length} more aren't`}{" "}
                      tied to one spot, like a festival, a food or a craft. See{" "}
                      {shown.length - pinned.length === 1 ? "it" : "them"} under
                      Cards.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}