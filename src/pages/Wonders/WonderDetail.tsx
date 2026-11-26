import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import RichText from "../../components/ui/RichText";
import { getWonder } from "../../features/wonders/api";
import WonderCover from "../../features/wonders/WonderCover";
import {
  hostOf,
  isYouTubeEmbed,
  mapLinkFor,
  pinOf,
  safeHttpUrl,
} from "../../features/wonders/helpers";
import {
  isWonderType,
  wonderTypeLabel,
  wonderTypePluralLabel,
  type WonderDetail as Wonder,
} from "../../features/wonders/types";
import { ApiError, getApiErrorMessage } from "../../services/api/client";

type WonderState =
  | { status: "loading" }
  | { status: "ready"; wonder: Wonder }
  | { status: "not-found" }
  | { status: "error"; message: string };

function WonderStory({ wonder }: { wonder: Wonder }) {
  const kind = wonderTypeLabel(wonder.wonder_type);
  const pin = pinOf(wonder);
  const embedUrl = isYouTubeEmbed(wonder.video_embed_url)
    ? wonder.video_embed_url
    : null;

  // Only normal web links are shown. Anything else is left out.
  const links = wonder.references.flatMap((reference) => {
    const href = safeHttpUrl(reference.url);
    return href ? [{ ...reference, href, host: hostOf(href) }] : [];
  });

  const hasStory = Boolean(wonder.content?.trim());

  // Put the wonder's name in the browser tab.
  useEffect(() => {
    const previous = document.title;
    document.title = `${wonder.title} — REKÒ`;
    return () => {
      document.title = previous;
    };
  }, [wonder.title]);

  return (
    <article className="bg-ivory text-ink">
      {/* Opening */}
      <header className="relative isolate overflow-hidden bg-deep-forest text-ivory">
        <WonderCover
          url={wonder.cover_image_url}
          alt={wonder.cover_image_alt}
          title={wonder.title}
          priority
          fallback="none"
          className="absolute inset-0 -z-10 h-full w-full"
        />
        {wonder.cover_image_url && (
          <>
            <div className="absolute inset-0 -z-10 bg-ink/45" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/20 to-ink/20" />
          </>
        )}

        <div className="container flex min-h-[55svh] flex-col justify-between py-10 md:min-h-[62svh] md:py-14">
          <Link
            to="/wonders"
            className="inline-flex w-fit items-center gap-2 text-body-s text-ivory/80 transition-colors hover:text-ivory"
          >
            <span aria-hidden>←</span> All hidden wonders
          </Link>

          <div className="max-w-4xl pt-24">
            <p className="text-label font-medium uppercase tracking-[0.2em] text-sand">
              {[kind, wonder.region].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-4 font-display text-display-m leading-[0.98]">
              {wonder.title}
            </h1>
            {wonder.cover_image_url && wonder.cover_image_credit && (
              <p className="mt-6 text-label text-ivory/70">
                Image: {wonder.cover_image_credit}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-20">
          {/* The story */}
          <div className="max-w-reading">
            {wonder.summary && (
              <p className="font-display text-heading-s leading-snug">
                {wonder.summary}
              </p>
            )}

            {hasStory && (
              <RichText
                html={wonder.content}
                className={`text-body-m leading-[1.8] text-ink/80 ${
                  wonder.summary ? "mt-8" : ""
                }`}
              />
            )}

            {!hasStory && !wonder.summary && (
              <p className="text-body-l text-muted">
                The full story of this wonder is on its way.
              </p>
            )}

            {embedUrl && (
              <section aria-labelledby="wonder-video" className="mt-14">
                <h2 id="wonder-video" className="text-heading-m">
                  Watch
                </h2>
                <div className="mt-6 aspect-video overflow-hidden bg-ink">
                  <iframe
                    src={embedUrl}
                    title={`Video about ${wonder.title}`}
                    loading="lazy"
                    allow="encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full border-0"
                  />
                </div>
              </section>
            )}

            {links.length > 0 && (
              <section
                aria-labelledby="wonder-learn-more"
                className="mt-16 border-t border-line pt-10"
              >
                <h2 id="wonder-learn-more" className="text-heading-m">
                  Learn more
                </h2>

                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-6 py-5"
                      >
                        <span>
                          <span className="block font-display text-heading-s leading-tight transition-colors group-hover:text-heritage-green">
                            {link.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </span>
                          {link.note && (
                            <span className="mt-1 block font-sans text-body-s text-muted">
                              {link.note}
                            </span>
                          )}
                          {link.host && (
                            <span className="mt-1 block font-sans text-meta text-muted">
                              {link.host}
                            </span>
                          )}
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-ink/40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* At a glance */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border-t-2 border-ochre bg-sand/30 p-6">
              <h2 className="text-label font-medium uppercase tracking-[0.2em] text-ochre-deep">
                At a glance
              </h2>

              <dl className="mt-5 space-y-4 font-sans text-body-s">
                {kind && (
                  <div>
                    <dt className="text-meta text-muted">Kind</dt>
                    <dd className="mt-0.5">{kind}</dd>
                  </div>
                )}
                {wonder.region && (
                  <div>
                    <dt className="text-meta text-muted">Where</dt>
                    <dd className="mt-0.5">{wonder.region}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-col items-start gap-3 text-body-s">
                {pin && (
                  <Link
                    to={mapLinkFor(wonder.slug)}
                    className="font-medium text-heritage-green underline underline-offset-4"
                  >
                    View on the map
                  </Link>
                )}
                {isWonderType(wonder.wonder_type) && (
                  <Link
                    to={`/wonders?type=${wonder.wonder_type}`}
                    className="text-ink underline underline-offset-4 hover:text-heritage-green"
                  >
                    More {wonderTypePluralLabel(wonder.wonder_type).toLowerCase()}
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <ArrowLink to="/wonders" className="text-heritage-green">
            Back to all hidden wonders
          </ArrowLink>
        </div>
      </div>
    </article>
  );
}

export default function WonderDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [loaded, setLoaded] = useState<{
    slug: string;
    state: WonderState;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWonder(slug)
      .then((wonder) => {
        if (!cancelled) {
          setLoaded({ slug, state: { status: "ready", wonder } });
        }
      })
      .catch((error: unknown) => {
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
                  "We couldn't load this wonder.",
                ),
              },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Until the answer for THIS wonder arrives, we are still loading.
  const state: WonderState =
    loaded?.slug === slug ? loaded.state : { status: "loading" };

  if (state.status === "ready") return <WonderStory wonder={state.wonder} />;

  return (
    <div className="bg-ivory text-ink">
      <div className="container py-16 md:py-24">
        {state.status === "loading" && (
          <PageLoader label="Loading this wonder…" />
        )}

        {state.status === "error" && (
          <PageError
            message={state.message}
            backTo="/wonders"
            backLabel="All hidden wonders"
          />
        )}

        {state.status === "not-found" && (
          <div role="alert">
            <h1 className="sr-only">Wonder not found</h1>
            <p className="max-w-xl text-body-l text-muted">
              We couldn't find that wonder. It may have moved, or it isn't
              published yet.
            </p>
            <Link
              to="/wonders"
              className="mt-6 inline-block border-b border-ink font-sans text-body-m font-medium"
            >
              See all hidden wonders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}