import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import ArrowLink from "../../components/ui/ArrowLink";

const ease = [0.22, 1, 0.36, 1] as const;

const imageModules = import.meta.glob("../../assets/**/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// Finds a file named <name> (any image extension) anywhere under src/assets.
function findImage(name: string): string | undefined {
  const path = Object.keys(imageModules).find((p) => {
    const base = p.split("/").pop() ?? "";
    return base.slice(0, base.lastIndexOf(".")) === name;
  });
  return path ? imageModules[path] : undefined;
}

type Piece = {
  file: string;
  alt?: string;
  title?: string;
  detail?: string;
  credit?: string;
  to?: string;
};

// The opening photograph. It is your about3 file, shown as it is.
// Fill in title, detail and credit to show a small caption on the photograph.
const heroPiece: Piece = {
  file: "about11",
  alt: "A man breathing fire", // change this if the photograph shows something else
  // title: "",
  // detail: "",
  // credit: "",
};

// Pieces that have no image yet are simply left out of the page,
// so the page never shows empty boxes. Add a file to src/assets and it appears.
const onView: Piece[] = [
  { file: "about7" },
  { file: "about8" },
  { file: "about10" },
  { file: "about3" },
];

const thenPiece: Piece = { file: "then" };
const nowPiece: Piece = { file: "now" };

const stages = ["Discover", "Explore", "Connect", "Understand"];

const galleries = [
  {
    name: "Exhibitions",
    body: "Walk through a story chapter by chapter, with images, documents and context at every stop.",
  },
  {
    name: "People",
    body: "The individuals behind the history, in the setting they lived in.",
  },
  {
    name: "Events",
    body: "The moments that turned things, and the evidence for what happened.",
  },
  {
    name: "Places",
    body: "Cities, sites and landscapes where history was made.",
  },
  {
    name: "Artifacts",
    body: "Objects to look at closely, and the stories of where they came from.",
  },
];

const ways = [
  {
    title: "Wander",
    body: "Start anywhere. Pick an object, a person or a year and see where it leads.",
  },
  {
    title: "Step inside an exhibition",
    body: "Each one runs chapter by chapter. Take it slowly or skim it.",
  },
  {
    title: "Check the sources",
    body: "Every chapter lists where its information comes from. Follow the trail yourself.",
  },
  {
    title: "Keep what you find",
    body: "Make an account to bookmark pieces, write notes and pick up where you left off.",
  },
];

/** Slides its content gently against the scroll, so neighbours move at different speeds. */
function Drift({
  distance,
  className = "",
  children,
}: {
  distance: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

function Plate({ piece, className = "" }: { piece: Piece; className?: string }) {
  const src = findImage(piece.file);
  if (!src) return null;

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <img
        src={src}
        alt={piece.alt ?? piece.title ?? ""}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** Museum-label caption. Only shows once the piece has a title. */
function Label({ tag, piece, className = "" }: { tag: string; piece: Piece; className?: string }) {
  if (!piece.title) return null;

  return (
    <figcaption className={`mt-4 ${className}`}>
      <div className="grid grid-cols-[3.5rem_1fr] gap-x-4 md:grid-cols-[4.5rem_1fr]">
        <span className="pt-1 text-label font-medium text-ochre">{tag}</span>
        <div>
          <p className="font-display text-heading-s leading-tight">{piece.title}</p>
          {piece.detail && <p className="mt-1 text-body-s text-muted">{piece.detail}</p>}
          {piece.credit && <p className="mt-1 text-label text-muted">{piece.credit}</p>}
        </div>
      </div>
    </figcaption>
  );
}

// ---- Opening: tuning ------------------------------------------------------
// Which part of the photograph stays in view. "50% 40%" means centred sideways
// and a little above the middle. Move the second number to show more of the
// top (smaller) or the bottom (bigger) of a tall photograph.
const HERO_FOCUS = "50% 40%";
// How far the photograph rises while the page slides over it, as a share of the
// screen height. 0 = it stays perfectly still. Keep it at 0.2 or less.
const PHOTO_DRIFT = 0.12;

// The opening: one full-screen photograph that stays where it is while the page
// slides up over it like a curtain. The photograph rises a little more slowly
// than the page, which is what gives the depth.
function Opening() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // 0 at the top of the page, 1 once the page has covered the whole photograph.
  const progress = useTransform(scrollY, (value) =>
    Math.min(1, Math.max(0, value / Math.max(window.innerHeight, 1))),
  );
  const photoY = useTransform(progress, (value) => -value * PHOTO_DRIFT * window.innerHeight);
  const wordsOpacity = useTransform(progress, (value) => Math.max(0, 1 - value * 1.8));
  const wordsLift = useTransform(progress, (value) => value * -50);
  const dim = useTransform(progress, (value) => value * 0.6);

  const src = findImage(heroPiece.file);

  return (
    // "sticky" keeps this in place while the rest of the page scrolls over it.
    <section className="sticky top-0 isolate h-svh min-h-[520px] overflow-hidden bg-deep-forest text-ivory">
      {src && (
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease }}
        >
          {/* 15% taller than the screen, so there is room to rise without a gap */}
          <motion.img
            src={src}
            alt={heroPiece.alt}
            decoding="async"
            style={{ y: reduce ? 0 : photoY, objectPosition: HERO_FOCUS }}
            className="absolute inset-x-0 top-0 h-[115%] w-full object-cover"
          />
        </motion.div>
      )}

      {/* Shade for the words (bottom and left) and for the nav (top) */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduce ? undefined : { opacity: wordsOpacity }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/45 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-ink/55 to-transparent" />
      </motion.div>

      {/* The photograph darkens as the page covers it */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-ink"
          style={{ opacity: dim }}
        />
      )}

      {/* pt-28 keeps everything clear of the nav */}
      <motion.div
        className="container relative z-10 flex h-full flex-col justify-end pb-12 pt-28 md:pb-16 md:pt-32"
        style={reduce ? undefined : { opacity: wordsOpacity, y: wordsLift }}
      >
        <p className="text-label font-medium uppercase tracking-[0.22em] text-sand">About REKÒ</p>

        <div className="mt-4 overflow-hidden pb-2">
          {/* The size follows the screen's height too, so it never grows into the nav */}
          <motion.h1
            className="max-w-4xl font-display text-[clamp(2.25rem,min(7vw,9svh),6rem)] leading-[0.95]"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
          >
            History is bigger than what made the textbook.
          </motion.h1>
        </div>

        <motion.p
          className="mt-5 max-w-2xl text-body-l text-ivory/85 [@media(max-height:520px)]:hidden"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 1.1 }}
        >
          REKÒ is a digital museum of Nigerian history and culture. Walk through exhibitions, look
          closely at objects, and read the sources behind every chapter.
        </motion.p>

        <div className="mt-8 flex items-end justify-between gap-6 [@media(max-height:520px)]:hidden">
          <div
            aria-hidden="true"
            className="flex items-center gap-3 text-label uppercase tracking-[0.22em] text-ivory/70"
          >
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-ivory/25">
              <motion.span
                className="absolute inset-x-0 top-0 block h-1/2 bg-ivory"
                animate={reduce ? undefined : { y: ["-100%", "200%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </div>

          {heroPiece.title && (
            <p className="hidden max-w-xs text-right text-meta text-ivory/70 md:block">
              {heroPiece.title}
              {heroPiece.credit && <span className="block">{heroPiece.credit}</span>}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default function About() {
  const shownOnView = onView.filter((piece) => findImage(piece.file));
  const showThenNow = Boolean(findImage(thenPiece.file) && findImage(nowPiece.file));

  return (
    <div className="relative text-ink">
      <Opening />

      {/* Everything below slides up over the photograph */}
      <div className="relative z-10 bg-ivory shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.35)]">
        {/* What REKÒ is for */}
        <section className="border-b border-line">
          <div className="container py-20 md:py-28 lg:py-36">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
              <motion.h2
                className="font-display text-display-m leading-[1.02] lg:col-span-7"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease }}
              >
                Most of us meet Nigerian history as dates and names.
              </motion.h2>

              <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
                <p className="text-body-l text-muted">
                  REKÒ puts the pieces back together: who was there, where it happened, what
                  survived, and how we know. Every exhibition is built on sourced evidence,
                  including the places where accounts disagree.
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-label font-medium uppercase tracking-widest text-heritage-green">
                  {stages.map((stage) => (
                    <li key={stage}>{stage}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* On view: the pictures, staggered and drifting at different speeds */}
        {shownOnView.length > 0 && (
          <section className="overflow-hidden border-b border-line">
            <div className="container py-20 md:py-28">
              <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
                <h2 className="font-display text-heading-l leading-tight">On view</h2>
                <p className="max-w-xl text-body-m text-muted md:pt-3">
                  Nigeria has hundreds of ethnic groups and languages, and no single exhibition can
                  hold them all. Each one here follows a single thread in depth and names who is
                  telling it.
                </p>
              </div>

              <div
                className={`mt-16 grid gap-x-6 gap-y-14 ${
                  shownOnView.length === 1
                    ? "mx-auto max-w-sm"
                    : shownOnView.length === 2
                      ? "sm:grid-cols-2 lg:mx-auto lg:max-w-4xl"
                      : "sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {shownOnView.map((piece, index) => {
                  const tag = `No. ${String(index + 2).padStart(2, "0")}`;
                  const content = (
                    <figure>
                      <Plate piece={piece} className="aspect-[4/5] w-full" />
                      <Label tag={tag} piece={piece} />
                    </figure>
                  );

                  return (
                    <Drift
                      key={piece.file}
                      distance={index % 2 === 0 ? 24 : 56}
                      className={index % 2 === 1 ? "lg:mt-24" : ""}
                    >
                      {piece.to ? (
                        <Link to={piece.to} className="block">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </Drift>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* What is inside: a description, not a menu */}
        <section className="border-b border-line">
          <div className="container py-20 md:py-28">
            <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
              <h2 className="font-display text-heading-l leading-tight">What&rsquo;s inside.</h2>
              <p className="max-w-xl text-body-m text-muted md:pt-3">
                REKÒ is arranged the way a museum is, by what you can look at. There is no right
                order.
              </p>
            </div>

            <ul className="mt-12 border-b border-line">
              {galleries.map((gallery) => (
                <li
                  key={gallery.name}
                  className="grid gap-2 border-t border-line py-7 md:grid-cols-[1fr_2fr] md:items-baseline md:gap-24 md:py-9"
                >
                  <span className="font-display text-heading-l leading-tight">{gallery.name}</span>
                  <span className="max-w-xl text-body-m text-muted">{gallery.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Principle: the dark room */}
        <section className="bg-deep-forest text-ivory">
          <div className="container py-20 md:py-28 lg:py-36">
            <h2 className="max-w-5xl font-display text-display-m leading-[0.98]">
              Every claim comes with its source. Where historians disagree, we say so.
            </h2>

            <p className="mt-8 max-w-2xl text-body-l text-ivory/75">
              We would rather you check us than trust us. Each chapter lists where its information
              comes from, and when the evidence supports more than one reading, you will see more
              than one.
            </p>
          </div>
        </section>

        {/* Then and now: only shown once both pictures exist */}
        {showThenNow && (
          <section className="border-b border-line">
            <div className="container py-20 md:py-28">
              <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
                <h2 className="font-display text-heading-l leading-tight">Then, and now</h2>
                <p className="max-w-xl text-body-m text-muted md:pt-3">
                  Documents from the archive sit beside photographs taken in recent years, so you
                  can see where one leads to the other.
                </p>
              </div>

              <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-10">
                <figure>
                  <Plate piece={thenPiece} className="aspect-[5/4] w-full" />
                  <Label tag="Then" piece={thenPiece} />
                </figure>

                <figure>
                  <Plate piece={nowPiece} className="aspect-[5/4] w-full" />
                  <Label tag="Now" piece={nowPiece} />
                </figure>
              </div>
            </div>
          </section>
        )}

        {/* How to use it */}
        <section className="border-b border-line">
          <div className="container py-20 md:py-28">
            <h2 className="font-display text-heading-l leading-tight">How to use REKÒ</h2>

            <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
              {ways.map((way) => (
                <div key={way.title} className="border-t border-line pt-6">
                  <dt className="font-display text-heading-s leading-tight">{way.title}</dt>
                  <dd className="mt-3 max-w-md text-body-m text-muted">{way.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-deep-forest text-ivory">
          <div className="container py-20 md:py-28 lg:py-36">
            <h2 className="max-w-4xl font-display text-display-m leading-[0.95]">
              Know Your Roots.
              <br />
              Own Your Future.
            </h2>

            <p className="mt-6 max-w-xl text-body-l text-ivory/75">
              Begin with one object, one person or one year. Follow it for as long as it holds your
              interest.
            </p>

            <div className="mt-10">
              <ArrowLink to="/explore" className="text-ivory">
                Explore REKÒ
              </ArrowLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}