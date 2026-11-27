import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import SourceList from "../../features/experience/components/SourceList";
import type { ExperiencePerson } from "../../features/experience/types";
import {
  usePersonMedia,
  usePersonSources,
} from "../../features/experience/useConnections";
import { formatYear } from "../../lib/dates";
import { toParagraphs } from "../../lib/text";
import { ApiError, getApiErrorMessage } from "../../services/api/client";
import { getData } from "../../services/api/request";
import AdaptiveImage from "../../components/ui/AdaptiveImage";

type PersonState =
  | { status: "loading" }
  | { status: "ready"; person: ExperiencePerson }
  | { status: "not-found" }
  | { status: "error"; message: string };

// "1933–1999", "Born 1933", "Died 1999", or nothing if no dates are known.
function lifeSpan(person: ExperiencePerson) {
  const born = person.birth_date ? formatYear(person.birth_date) : null;
  const died = person.death_date ? formatYear(person.death_date) : null;

  if (born && died) return `${born}–${died}`;
  if (born) return `Born ${born}`;
  if (died) return `Died ${died}`;
  return null;
}

// Letters shown when a person has no portrait yet ("Oba Eweka I" -> "EI").
const TITLES = ["Oba", "Chief", "Prince", "Queen", "Mother", "Dr", "Sir"];

function initials(name: string) {
  return name
    .split(" ")
    .filter((word) => !TITLES.includes(word))
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}

function PersonStory({ person }: { person: ExperiencePerson }) {
  const { items: media } = usePersonMedia(person.id);
  const {
    items: sources,
    status,
    error: sourcesError,
  } = usePersonSources(person.id);

  const [lead, ...rest] = toParagraphs(person.description);
  const image = media.find((item) => item.media_type === "image");
  const years = lifeSpan(person);

  // Put the person's name in the browser tab.
  useEffect(() => {
    const previous = document.title;
    document.title = `${person.name} — REKÒ`;
    return () => {
      document.title = previous;
    };
  }, [person.name]);

  return (
    <article className="bg-ivory text-ink">
      <div className="container py-12 md:py-20">
        <Link
          to="/explore/people"
          className="inline-flex items-center gap-2 text-body-s text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> All people
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          {/* Portrait */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {image ? (
              <figure>
                <AdaptiveImage
                  src={image.file_url}
                  alt={person.name}
                  maxHeight="max-h-[70svh]"
                  className="max-w-sm lg:max-w-none"
                />
                {image.source_credit && (
                  <figcaption className="mt-2 font-sans text-label text-muted">
                    Credit: {image.source_credit}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div
                aria-hidden="true"
                className="flex aspect-4/5 w-full max-w-sm items-center justify-center border-t-2 border-ochre bg-sand/40 font-display text-heading-l text-ink/30 lg:max-w-none"
              >
                {initials(person.name)}
              </div>
            )}
          </aside>

          {/* Story */}
          <div>
            {years && (
              <p className="font-display text-heading-s text-ochre">{years}</p>
            )}
            <h1 className="mt-2 text-heading-l leading-[1.05]">
              {person.name}
            </h1>

            {lead && (
              <p className="mt-8 max-w-176 font-display text-heading-s leading-snug">
                {lead}
              </p>
            )}

            <div className="mt-8 max-w-176 space-y-6">
              {rest.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-sans text-body-m leading-[1.8] text-ink/80"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Sources */}
        <section className="mt-16 border-t border-line pt-12 md:mt-24">
          <h2 className="text-heading-m">Sources</h2>

          {status === "error" && (
            <p className="mt-4 font-sans text-body-s text-muted">
              {sourcesError ??
                "We couldn't load the sources. Please refresh to try again."}
            </p>
          )}

          {sources.length > 0 && (
            <div className="mt-6">
              <SourceList sources={sources} />
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

export default function PersonPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [loaded, setLoaded] = useState<{
    slug: string;
    state: PersonState;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    getData<ExperiencePerson>(`/people/${encodeURIComponent(slug)}`)
      .then((person) => {
        if (!cancelled) {
          setLoaded({ slug, state: { status: "ready", person } });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        const notFound = error instanceof ApiError && error.status === 404;
        setLoaded({
          slug,
          state: notFound
            ? { status: "not-found" }
            : {
                status: "error",
                message: getApiErrorMessage(
                  error,
                  "We couldn't load this person.",
                ),
              },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Until the answer for THIS person arrives, we are still loading.
  const state: PersonState =
    loaded?.slug === slug ? loaded.state : { status: "loading" };

  if (state.status === "ready") return <PersonStory person={state.person} />;

  return (
    <div className="bg-ivory text-ink">
      <div className="container py-16 md:py-24">
        {state.status === "loading" && (
          <PageLoader label="Loading their story…" />
        )}

        {state.status === "error" && <PageError message={state.message} />}

        {state.status === "not-found" && (
          <div role="alert">
            <p className="max-w-xl text-body-l text-muted">
              We couldn't find that person. They may have moved or aren't
              published yet.
            </p>
            <Link
              to="/explore/people"
              className="mt-6 inline-block border-b border-ink font-sans text-body-m font-medium"
            >
              See all people
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
