import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getStories, storyPath } from "../../features/stories/api";
import {
  STORY_CATEGORIES,
  categoryLabel,
  categoryPluralLabel,
  isStoryCategory,
} from "../../features/stories/Category";
import type { StorySummary } from "../../features/stories/types";

// The words on this page. Change them here.
const copy = {
  label: "STORIES",
  heading: "Some stories reach us through a voice.",
  intro:
    "Meet the heroes, spirits and everyday people of Nigeria’s storytelling traditions, where memory and imagination meet.",
  empty: "No stories have been published yet.",
  emptyFiltered: "No stories in this group yet.",
  error: "We couldn't load the stories. Please try again in a moment.",
};

function Cover({ story, className }: { story: StorySummary; className: string }) {
  const [failed, setFailed] = useState(false);

  if (!story.cover_image_url || failed) {
    // A quiet tile instead of a broken or missing picture.
    return (
      <div className={`flex items-end bg-sand/40 p-4 ${className}`}>
        <span className="text-label uppercase tracking-wide text-ink/40">
          {categoryLabel(story.category) ?? "Story"}
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-sand/40 ${className}`}>
      <img
        src={story.cover_image_url}
        alt={story.cover_image_alt ?? ""}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
      />
    </div>
  );
}

function Kicker({ story }: { story: StorySummary }) {
  const label = categoryLabel(story.category);
  if (!label) return null;

  return (
    <p className="text-label font-medium uppercase tracking-[0.18em] text-ochre">{label}</p>
  );
}

// The newest story, shown large.
function Featured({ story }: { story: StorySummary }) {
  return (
    <Link
      to={storyPath(story.slug)}
      className="group grid items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-16"
    >
      <Cover story={story} className="aspect-4/3 md:col-span-7" />

      <div className="md:col-span-5">
        <Kicker story={story} />
        <h2 className="mt-3 font-display text-heading-l leading-[1.02] transition-colors group-hover:text-heritage-green">
          {story.title}
        </h2>
        {story.excerpt && (
          <p className="mt-5 line-clamp-4 text-body-l text-muted">{story.excerpt}</p>
        )}
        <span className="mt-8 inline-flex items-center gap-3 border-b border-current pb-1 text-body-m font-medium">
          Read the story <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

function Item({ story }: { story: StorySummary }) {
  return (
    <Link to={storyPath(story.slug)} className="group block">
      <Cover story={story} className="aspect-4/3" />
      <div className="mt-5">
        <Kicker story={story} />
        <h3 className="mt-2 font-display text-heading-s leading-tight transition-colors group-hover:text-heritage-green">
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="mt-2 line-clamp-3 text-body-s text-muted">{story.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

export default function Stories() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    getStories()
      .then((result) => {
        if (cancelled) return;
        setStories(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The chosen group lives in the address (?category=folklore), so it can be
  // shared and the back button works.
  const requested = params.get("category");
  const active = isStoryCategory(requested) ? requested : null;

  // Only offer groups that have at least one story.
  const available = useMemo(
    () => STORY_CATEGORIES.filter((category) => stories.some((story) => story.category === category)),
    [stories],
  );

  const shown = active ? stories.filter((story) => story.category === active) : stories;
  const [featured, ...rest] = shown;

  function choose(category: string | null) {
    setParams(category ? { category } : {}, { replace: true });
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
          <p className="text-label font-medium tracking-[0.2em] text-ochre">{copy.label}</p>
          <h1 className="mt-5 max-w-3xl font-display text-display-m leading-[0.98]">
            {copy.heading}
          </h1>
          <p className="mt-6 max-w-xl text-body-l text-muted">{copy.intro}</p>

          {available.length > 1 && (
            <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter stories">
              <button
                type="button"
                onClick={() => choose(null)}
                aria-pressed={!active}
                className={chip(!active)}
              >
                All
              </button>
              {available.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => choose(category)}
                  aria-pressed={active === category}
                  className={chip(active === category)}
                >
                  {categoryPluralLabel(category)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="container py-14 md:py-20">
          {status === "loading" && (
            <p className="text-body-m text-muted" aria-live="polite">
              Loading stories…
            </p>
          )}

          {status === "error" && (
            <p role="alert" className="text-body-m text-muted">
              {copy.error}
            </p>
          )}

          {status === "ready" && shown.length === 0 && (
            <p className="text-body-m text-muted">
              {active ? copy.emptyFiltered : copy.empty}
            </p>
          )}

          {status === "ready" && featured && (
            <>
              <Featured story={featured} />

              {rest.length > 0 && (
                <div className="mt-16 grid gap-x-8 gap-y-14 border-t border-line pt-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((story) => (
                    <Item key={story.id} story={story} />
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