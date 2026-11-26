import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  getCollection,
  type CollectionItem,
  type CollectionKind,
} from "../../features/collections/api";
import { getBundles } from "../../features/bundles/api";
import {
  itemsInBundle,
  standaloneItems,
  tilesOf,
} from "../../features/bundles/helpers";
import {
  ExhibitionHeader,
  ExhibitionTile,
} from "../../features/bundles/components/BundleViews";
import type { Bundle, BundleKind } from "../../features/bundles/types";
import { useDiscovery } from "../../features/experience/discovery/discovery-context";
import PageLoader from "../../components/ui/PageLoader";
import PageError from "../../components/ui/PageError";
import { getApiErrorMessage } from "../../services/api/client";

const NO_BUNDLES: Bundle[] = [];
const NO_ITEMS: CollectionItem[] = [];

// Places has its own page, so it is not here.
const BUNDLE_LABELS: Record<
  BundleKind,
  { noun: string; path: string; all: string; heading: string }
> = {
  people: {
    noun: "people",
    path: "/explore/people",
    all: "All people",
    heading: "People, grouped by exhibition",
  },
  events: {
    noun: "events",
    path: "/explore/events",
    all: "All events",
    heading: "Events, grouped by exhibition",
  },
  artifacts: {
    noun: "artifacts",
    path: "/explore/artifacts",
    all: "All artifacts",
    heading: "Artifacts, grouped by exhibition",
  },
};

// The words that change between the four pages.
const copy: Record<
  CollectionKind,
  { label: string; heading: string; intro: string; empty: string }
> = {
  people: {
    label: "EXPLORE PEOPLE",
    heading: "The people behind the stories.",
    intro:
      "Leaders, thinkers, artists and ordinary people whose choices shaped Nigeria.",
    empty: "No people have been published yet.",
  },
  events: {
    label: "EXPLORE EVENTS",
    heading: "The moments that changed things.",
    intro: "Meetings, decisions, turning points and the days around them.",
    empty: "No events have been published yet.",
  },
  places: {
    label: "EXPLORE PLACES",
    heading: "Where history happened.",
    intro: "The cities, buildings and landscapes where these stories unfolded.",
    empty: "No places have been published yet.",
  },
  artifacts: {
    label: "EXPLORE ARTIFACTS",
    heading: "What survived.",
    intro: "Documents, photographs and objects. The evidence behind the story.",
    empty: "No artifacts have been published yet.",
  },
};

function Card({
  item,
  onOpen,
  partOf = null,
}: {
  item: CollectionItem;
  onOpen: () => void;
  partOf?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const isLong = (item.description?.length ?? 0) > 180;

  return (
    <article>
      {/* Mouse users can click the picture. Keyboard and screen reader users
          use the title button below, so this one is skipped. */}
      <button
        type="button"
        onClick={onOpen}
        tabIndex={-1}
        aria-hidden="true"
        className="block w-full text-left"
      >
        <div className="aspect-4/5 overflow-hidden bg-sand/40">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-5">
              <span
                aria-hidden="true"
                className="font-display text-display-m leading-none text-ink/20"
              >
                {item.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </button>

      {item.credit && (
        <p className="mt-2 font-sans text-meta text-muted">
          Image: {item.credit}
        </p>
      )}

      {item.meta && (
        <p className="mt-5 font-display text-heading-s text-ochre-deep">
          {item.meta}
        </p>
      )}

      <h2 className="mt-1 font-display text-heading-m leading-tight">
        <button
          type="button"
          onClick={onOpen}
          className="text-left hover:text-heritage-green"
        >
          {item.title}
        </button>
      </h2>

      {item.description && (
        <p
          className={`mt-3 font-sans text-body-m text-muted ${
            open ? "" : "line-clamp-3"
          }`}
        >
          {item.description}
        </p>
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-3 font-sans text-body-s underline underline-offset-4 hover:text-heritage-green"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}

      {partOf && (
        <p className="mt-3 font-sans text-meta text-muted">Part of {partOf}</p>
      )}
    </article>
  );
}

export default function CollectionPage({ kind }: { kind: CollectionKind }) {
  const reduce = useReducedMotion();
  const words = copy[kind];
  const bundleInfo = kind === "places" ? null : BUNDLE_LABELS[kind];

  const { openRef } = useDiscovery();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const exhibitionSlug = params.get("exhibition") ?? "";

  const [items, setItems] = useState<CollectionItem[]>(NO_ITEMS);
  const [bundles, setBundles] = useState<Bundle[]>(NO_BUNDLES);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState(
    "We couldn't load this collection.",
  );
  const [query, setQuery] = useState("");

  // Runs again when the visitor moves between People, Events, Places and
  // Artifacts, because they all use this one page.
  const [loadedKind, setLoadedKind] = useState<CollectionKind | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getCollection(kind),
      // If the exhibitions can't be loaded, the page simply shows the plain list.
      kind === "places"
        ? Promise.resolve(NO_BUNDLES)
        : getBundles(kind).catch(() => NO_BUNDLES),
    ])
      .then(([data, groups]) => {
        if (cancelled) return;
        setItems(data);
        setBundles(groups);
        setLoadedKind(kind);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadedKind(kind);
          setLoadError(
            getApiErrorMessage(error, "We couldn't load this collection."),
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  const currentStatus = loadedKind === kind ? status : "loading";
  const currentItems = loadedKind === kind ? items : NO_ITEMS;
  const currentBundles = loadedKind === kind ? bundles : NO_BUNDLES;

  const search = query.trim().toLowerCase();
  const searching = search !== "";
  const matches = useMemo(
    () =>
      searching
        ? currentItems.filter((item) =>
            `${item.title} ${item.description ?? ""}`
              .toLowerCase()
              .includes(search),
          )
        : currentItems,
    [searching, search, currentItems],
  );

  // A search always shows the plain list, never tiles or one exhibition.
  const activeBundle =
    !searching && exhibitionSlug
      ? currentBundles.find((bundle) => bundle.slug === exhibitionSlug)
      : undefined;
  const missingExhibition =
    Boolean(exhibitionSlug) &&
    !searching &&
    !activeBundle &&
    currentStatus === "ready";

  const tiles = useMemo(() => tilesOf(currentBundles), [currentBundles]);
  const plainPage = !searching && !activeBundle;
  const showTiles = Boolean(bundleInfo) && plainPage && tiles.length > 0;

  const cards = useMemo(() => {
    if (activeBundle) {
      return itemsInBundle(activeBundle, currentItems).map((item) => ({
        item,
        partOf: null as string | null,
      }));
    }
    // On the plain page, items already inside a tile are not repeated, and a
    // lone item keeps its card with a "Part of" label.
    if (plainPage && bundleInfo) {
      return standaloneItems(currentItems, currentBundles);
    }
    return matches.map((item) => ({ item, partOf: null as string | null }));
  }, [activeBundle, plainPage, bundleInfo, currentItems, currentBundles, matches]);

  const open = (item: CollectionItem) => {
    // Events have a page of their own. The rest open in the side drawer.
    if (kind === "events") navigate(`/events/${item.id}`);
    else void openRef(item.ref);
  };

  return (
    <div className="bg-ivory text-ink">
      {/* Opening */}
      <section className="border-b border-line">
        <div className="container py-24 md:py-32">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-ochre-deep">
              {words.label}
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-display-l leading-[0.92]">
              {words.heading}
            </h1>

            <p className="mt-8 max-w-2xl text-body-l text-muted">
              {words.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Collection */}
      <section className="py-16 md:py-24">
        <div className="container">
          {currentStatus === "loading" && <PageLoader />}
          {currentStatus === "error" && <PageError message={loadError} />}

          {currentStatus === "ready" && currentItems.length === 0 && (
            <p className="text-body-m text-muted">{words.empty}</p>
          )}

          {currentStatus === "ready" && currentItems.length > 0 && (
            <>
              <div className="mb-14 max-w-sm">
                <label htmlFor="collection-search" className="sr-only">
                  Search this page
                </label>
                <input
                  id="collection-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this page"
                  className="h-12 w-full border border-line bg-transparent px-4 text-body-m transition-colors focus:border-heritage-green"
                />
              </div>

              {activeBundle && bundleInfo && (
                <ExhibitionHeader
                  bundle={activeBundle}
                  count={cards.length}
                  basePath={bundleInfo.path}
                  noun={bundleInfo.noun}
                  allLabel={bundleInfo.all}
                />
              )}

              {missingExhibition && bundleInfo && (
                <p role="status" className="mb-10 text-body-m text-muted">
                  We couldn't find that exhibition. Here is everything we do
                  have.{" "}
                  <Link
                    to={bundleInfo.path}
                    className="text-heritage-green underline underline-offset-4"
                  >
                    See all {bundleInfo.noun}
                  </Link>
                </p>
              )}

              {showTiles && bundleInfo && (
                <section
                  aria-labelledby="collection-exhibitions-heading"
                  className="mb-16"
                >
                  <p className="text-label uppercase tracking-[0.16em] text-ochre-deep">
                    From the exhibitions
                  </p>
                  <h2
                    id="collection-exhibitions-heading"
                    className="mt-1 font-display text-heading-m"
                  >
                    {bundleInfo.heading}
                  </h2>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {tiles.map((bundle) => (
                      <ExhibitionTile
                        key={bundle.id}
                        bundle={bundle}
                        basePath={bundleInfo.path}
                        noun={bundleInfo.noun}
                      />
                    ))}
                  </div>
                </section>
              )}

              {cards.length === 0 && !showTiles ? (
                <p className="text-body-m text-muted">
                  Nothing matches “{query}”.
                </p>
              ) : (
                cards.length > 0 && (
                  <section className={activeBundle ? "mt-10" : undefined}>
                    {showTiles && (
                      <h2 className="mb-8 font-display text-heading-m">
                        More {bundleInfo?.noun} to explore
                      </h2>
                    )}
                    <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                      {cards.map(({ item, partOf }) => (
                        <Card
                          key={item.id}
                          item={item}
                          partOf={partOf}
                          onOpen={() => open(item)}
                        />
                      ))}
                    </div>
                  </section>
                )
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}