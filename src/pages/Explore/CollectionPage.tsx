import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  getCollection,
  type CollectionItem,
  type CollectionKind,
} from "../../features/collections/api";

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

function Card({ item }: { item: CollectionItem }) {
  const [open, setOpen] = useState(false);
  const isLong = (item.description?.length ?? 0) > 180;

  return (
    <article>
      <div className="aspect-4/5 overflow-hidden bg-sand/40">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-5">
            <span
              aria-hidden
              className="font-display text-display-m leading-none text-ink/20"
            >
              {item.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {item.meta && (
        <p className="mt-5 font-display text-heading-s text-ochre">
          {item.meta}
        </p>
      )}

      <h2 className="mt-1 font-display text-heading-m leading-tight">
        {item.title}
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

      {open && item.credit && (
        <p className="mt-3 font-sans text-meta text-muted">
          Image: {item.credit}
        </p>
      )}
    </article>
  );
}

export default function CollectionPage({ kind }: { kind: CollectionKind }) {
  const reduce = useReducedMotion();
  const words = copy[kind];

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [query, setQuery] = useState("");

  // Runs again when the visitor moves between People, Events, Places and
  // Artifacts, because they all use this one page.
  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setItems([]);
    setQuery("");

    getCollection(kind)
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  const search = query.trim().toLowerCase();
  const visible = search
    ? items.filter((item) =>
        `${item.title} ${item.description ?? ""}`
          .toLowerCase()
          .includes(search),
      )
    : items;

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
            <p className="text-label font-medium tracking-[0.2em] text-ochre">
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
          {status === "loading" && (
            <p className="text-body-m text-muted">Loading…</p>
          )}

          {status === "error" && (
            <p role="alert" className="text-body-m text-error">
              We couldn't load this collection. Please try again.
            </p>
          )}

          {status === "ready" && items.length === 0 && (
            <p className="text-body-m text-muted">{words.empty}</p>
          )}

          {status === "ready" && items.length > 0 && (
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
                  className="h-12 w-full border border-line bg-transparent px-4 text-body-m outline-none transition-colors focus:border-heritage-green"
                />
              </div>

              {visible.length === 0 ? (
                <p className="text-body-m text-muted">
                  Nothing matches “{query}”.
                </p>
              ) : (
                <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((item) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
