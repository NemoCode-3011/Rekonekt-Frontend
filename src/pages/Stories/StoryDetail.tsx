import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SourceList from "../../features/experience/components/SourceList";
import type { ExperienceSource } from "../../features/experience/types";
import { getStory, getStorySources } from "../../features/stories/api";
import { categoryLabel } from "../../features/stories/Category";
import type { Story } from "../../features/stories/types";
import RichText from "../../components/ui/RichText";
import { ApiError } from "../../services/api/client";
import { splitStoryHtml } from "../../lib/richText";

// The story image appears after this many paragraphs or headings.
const BODY_IMAGE_AFTER = 57;

type State =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; story: Story };

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<State>({ status: "loading" });
  const [sources, setSources] = useState<ExperienceSource[]>([]);

  // Load the story whose slug is in the address.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setState({ status: "loading" });
    setSources([]);

    getStory(slug)
      .then((story) => {
        if (cancelled) return;
        setState({ status: "ready", story });

        // The sources are extra. If they can't be loaded, the story still reads fine.
        getStorySources(story.id)
          .then((list) => {
            if (!cancelled) setSources(list);
          })
          .catch(() => {});
      })
      .catch((error) => {
        if (cancelled) return;
        setState(
          error instanceof ApiError && error.status === 404
            ? { status: "not-found" }
            : { status: "error" },
        );
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Put the story's title in the browser tab.
  const title = state.status === "ready" ? state.story.title : null;
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} — REKÒ`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  const back = (
    <Link
      to="/stories"
      className="inline-flex items-center gap-2 text-body-s text-muted transition-colors hover:text-ink"
    >
      <span aria-hidden>←</span> All stories
    </Link>
  );

  if (state.status !== "ready") {
    return (
      <div className="bg-ivory text-ink">
        <div className="container py-16 md:py-24">
          {back}
          <p
            role={state.status === "loading" ? undefined : "alert"}
            aria-live={state.status === "loading" ? "polite" : undefined}
            className="mt-10 max-w-xl text-body-l text-muted"
          >
            {state.status === "loading" && "Loading the story…"}
            {state.status === "not-found" &&
              "We couldn't find that story. It may have moved or isn't published yet."}
            {state.status === "error" &&
              "We couldn't load this story. Please try again in a moment."}
          </p>
        </div>
      </div>
    );
  }

  const { story } = state;
  const label = categoryLabel(story.category);
  const [before, after] = story.body_image_url
    ? splitStoryHtml(story.content, BODY_IMAGE_AFTER)
    : [story.content, ""];

  return (
    <article className="bg-ivory text-ink">
      <header className="container pt-12 md:pt-16">
        {back}

        {label && (
          <p className="mt-10 text-label font-medium uppercase tracking-[0.2em] text-ochre">
            {label}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl font-display text-display-m leading-[0.98]">
          {story.title}
        </h1>
        {story.excerpt && (
          <p className="mt-6 max-w-2xl font-display text-heading-s leading-snug text-ink/80">
            {story.excerpt}
          </p>
        )}
      </header>

      {story.cover_image_url && (
        <figure className="container mt-12">
          <img
            src={story.cover_image_url}
            alt={story.cover_image_alt ?? ""}
            decoding="async"
            className="max-h-[75svh] w-full object-cover"
          />
          {story.cover_image_credit && (
            <figcaption className="mt-3 max-w-3xl text-label text-muted">
              {story.cover_image_credit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="container py-14 md:py-20">
        <div className="max-w-2xl">
          {story.did_you_know && (
            <aside className="mb-12 border-l-2 border-ochre pl-5">
              <p className="text-label font-medium tracking-[0.2em] text-ochre">
                DID YOU KNOW?
              </p>
              <p className="mt-2 font-display text-heading-s leading-snug">
                {story.did_you_know}
              </p>
            </aside>
          )}

          <RichText html={before} className="text-body-l leading-relaxed" />

          {story.body_image_url && (
            <figure className="my-12">
              <img
                src={story.body_image_url}
                alt={story.body_image_alt ?? ""}
                loading="lazy"
                decoding="async"
                className="max-h-[70svh] w-full object-cover"
              />
              {story.body_image_credit && (
                <figcaption className="mt-3 text-label text-muted">
                  {story.body_image_credit}
                </figcaption>
              )}
            </figure>
          )}

          {after && (
            <RichText html={after} className="text-body-l leading-relaxed" />
          )}
        </div>

        {sources.length > 0 && (
          <section className="mt-20 border-t border-line pt-10">
            <h2 className="font-display text-heading-m">Sources</h2>
            <div className="mt-6">
              <SourceList sources={sources} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
