import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import RichText from "../../components/ui/RichText";
import { getEvent } from "../../features/experience/api";
import SourceList from "../../features/experience/components/SourceList";
import { useDiscovery } from "../../features/experience/discovery/discovery-context";
import type {
  ExperienceEvent,
  ExperienceMedia,
} from "../../features/experience/types";
import {
  useEventMedia,
  useEventPeople,
  useEventPlaces,
  useEventSources,
} from "../../features/experience/useConnections";
import WonderCover from "../../features/wonders/WonderCover";
import { formatYear } from "../../lib/dates";
import { isYouTubeEmbedUrl } from "../../lib/youtube";
import { ApiError, getApiErrorMessage } from "../../services/api/client";

type EventState =
  | { status: "loading" }
  | { status: "ready"; event: ExperienceEvent }
  | { status: "not-found" }
  | { status: "error"; message: string };

function dateLabel(event: ExperienceEvent) {
  if (event.date_display) return event.date_display;
  return event.event_date ? String(formatYear(event.event_date)) : null;
}

// One video or picture that belongs to the event.
function MediaFigure({ item, eventTitle }: { item: ExperienceMedia; eventTitle: string }) {
  const caption = item.caption ?? (item.media_type === "image" ? null : item.title);

  return (
    <figure>
      {item.media_type === "video" && item.video_provider === "youtube" && (
        <div className="aspect-video overflow-hidden bg-ink">
          <iframe
            src={item.embed_url ?? undefined}
            title={item.title || `Video about ${eventTitle}`}
            loading="lazy"
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
      )}

      {item.media_type === "video" && item.video_provider !== "youtube" && (
        <video
          controls
          preload="metadata"
          src={item.file_url}
          className="aspect-video w-full bg-ink"
        />
      )}

      {item.media_type === "image" && (
        <img
          src={item.file_url}
          alt={item.description ?? item.caption ?? item.title}
          loading="lazy"
          className="w-full"
        />
      )}

      {(caption || item.source_credit) && (
        <figcaption className="mt-3 font-sans text-body-s text-muted">
          {caption}
          {caption && item.source_credit && " · "}
          {item.source_credit && `Credit: ${item.source_credit}`}
        </figcaption>
      )}
    </figure>
  );
}

function EventStory({ event }: { event: ExperienceEvent }) {
  const { openRef } = useDiscovery();
  const { items: media } = useEventMedia(event.id);
  const { items: people } = useEventPeople(event.id);
  const { items: places } = useEventPlaces(event.id);
  const { items: sources } = useEventSources(event.id);

  const label = dateLabel(event);
  const hasStory = Boolean(event.description?.trim());

  // A video is only shown if it is a real YouTube embed (or an uploaded file).
  const videos = media.filter(
    (item) =>
      item.media_type === "video" &&
      (item.video_provider !== "youtube" || isYouTubeEmbedUrl(item.embed_url)),
  );
  const pictures = media.filter((item) => item.media_type === "image");
  const files = media.filter(
    (item) => item.media_type === "document" || item.media_type === "audio",
  );

  // Put the event's name in the browser tab.
  useEffect(() => {
    const previous = document.title;
    document.title = `${event.title} — REKÒ`;
    return () => {
      document.title = previous;
    };
  }, [event.title]);

  return (
    <article className="bg-ivory text-ink">
      {/* Opening */}
      <header className="relative isolate overflow-hidden bg-deep-forest text-ivory">
        <WonderCover
          url={event.image_url}
          alt={null}
          title={event.title}
          priority
          fallback="none"
          className="absolute inset-0 -z-10 h-full w-full"
        />
        {event.image_url && (
          <>
            <div className="absolute inset-0 -z-10 bg-ink/50" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/20 to-ink/20" />
          </>
        )}

        <div className="container flex min-h-[50svh] flex-col justify-between py-10 md:min-h-[58svh] md:py-14">
          <Link
            to="/explore/events"
            className="inline-flex w-fit items-center gap-2 text-body-s text-ivory/80 transition-colors hover:text-ivory"
          >
            <span aria-hidden>←</span> All events
          </Link>

          <div className="max-w-4xl pt-24">
            {label && (
              <p className="font-display text-heading-m leading-none tracking-[-0.03em] text-ochre-light">
                {label}
              </p>
            )}
            <h1 className="mt-4 font-display text-display-m leading-[0.98]">
              {event.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="container py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-20">
          {/* The story */}
          <div className="max-w-reading">
            {hasStory ? (
              <RichText
                html={event.description}
                className="text-body-m leading-[1.8] text-ink/80"
              />
            ) : (
              videos.length + pictures.length === 0 && (
                <p className="text-body-l text-muted">
                  The full story of this moment is on its way.
                </p>
              )
            )}

            {videos.length > 0 && (
              <section aria-labelledby="event-watch" className="mt-14">
                <h2 id="event-watch" className="text-heading-m">
                  Watch
                </h2>
                <div className="mt-6 space-y-10">
                  {videos.map((item) => (
                    <MediaFigure key={item.id} item={item} eventTitle={event.title} />
                  ))}
                </div>
              </section>
            )}

            {pictures.length > 0 && (
              <section aria-labelledby="event-pictures" className="mt-14">
                <h2 id="event-pictures" className="text-heading-m">
                  Pictures
                </h2>
                <div className="mt-6 space-y-10">
                  {pictures.map((item) => (
                    <MediaFigure key={item.id} item={item} eventTitle={event.title} />
                  ))}
                </div>
              </section>
            )}

            {files.length > 0 && (
              <section aria-labelledby="event-files" className="mt-14">
                <h2 id="event-files" className="text-heading-m">
                  Files
                </h2>
                <ul className="mt-6 space-y-2">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-b border-ink font-sans text-body-m font-medium"
                      >
                        Open {file.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sources.length > 0 && (
              <section
                aria-labelledby="event-sources"
                className="mt-16 border-t border-line pt-10"
              >
                <h2 id="event-sources" className="text-heading-m">
                  Sources
                </h2>
                <div className="mt-6">
                  <SourceList sources={sources} />
                </div>
              </section>
            )}
          </div>

          {/* At a glance */}
          {(label || places.length > 0 || people.length > 0) && (
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="border-t-2 border-ochre bg-sand/30 p-6">
                <h2 className="text-label font-medium uppercase tracking-[0.2em] text-ochre-deep">
                  At a glance
                </h2>

                <dl className="mt-5 space-y-5 font-sans text-body-s">
                  {label && (
                    <div>
                      <dt className="text-meta text-muted">When</dt>
                      <dd className="mt-0.5">{label}</dd>
                    </div>
                  )}

                  {places.length > 0 && (
                    <div>
                      <dt className="text-meta text-muted">Where</dt>
                      <dd className="mt-1 flex flex-col items-start gap-1.5">
                        {places.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => {
                              void openRef({ kind: "place", id: place.id });
                            }}
                            className="text-left underline underline-offset-4 hover:text-heritage-green"
                          >
                            {place.name}
                          </button>
                        ))}
                      </dd>
                    </div>
                  )}

                  {people.length > 0 && (
                    <div>
                      <dt className="text-meta text-muted">Who</dt>
                      <dd className="mt-1 flex flex-col items-start gap-1.5">
                        {people.map((person) => (
                          <Link
                            key={person.id}
                            to={`/people/${person.slug}`}
                            className="underline underline-offset-4 hover:text-heritage-green"
                          >
                            {person.name}
                          </Link>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          )}
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <ArrowLink to="/explore/events" className="text-heritage-green">
            Back to all events
          </ArrowLink>
        </div>
      </div>
    </article>
  );
}

export default function EventPage() {
  const { id = "" } = useParams<{ id: string }>();
  const eventId = Number(id);
  const validId = Number.isInteger(eventId) && eventId > 0;

  const [loaded, setLoaded] = useState<{
    id: number;
    state: EventState;
  } | null>(null);

  useEffect(() => {
    if (!validId) return;
    let cancelled = false;

    getEvent(eventId)
      .then((event) => {
        if (!cancelled) setLoaded({ id: eventId, state: { status: "ready", event } });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const notFound = error instanceof ApiError && error.status === 404;
        setLoaded({
          id: eventId,
          state: notFound
            ? { status: "not-found" }
            : {
                status: "error",
                message: getApiErrorMessage(error, "We couldn't load this event."),
              },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, validId]);

  // Until the answer for THIS event arrives, we are still loading.
  const state: EventState = !validId
    ? { status: "not-found" }
    : loaded?.id === eventId
      ? loaded.state
      : { status: "loading" };

  if (state.status === "ready") return <EventStory event={state.event} />;

  return (
    <div className="bg-ivory text-ink">
      <div className="container py-16 md:py-24">
        {state.status === "loading" && <PageLoader label="Loading this event…" />}

        {state.status === "error" && (
          <PageError
            message={state.message}
            backTo="/explore/events"
            backLabel="All events"
          />
        )}

        {state.status === "not-found" && (
          <div role="alert">
            <h1 className="sr-only">Event not found</h1>
            <p className="max-w-xl text-body-l text-muted">
              We couldn't find that event. It may have moved, or it isn't
              published yet.
            </p>
            <Link
              to="/explore/events"
              className="mt-6 inline-block border-b border-ink font-sans text-body-m font-medium"
            >
              See all events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}