import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
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

const heroPiece: Piece = { file: "about3" };

const onView: Piece[] = [
  { file: "about2" },
  { file: "on-view-2" },
  { file: "on-view-3" },
  { file: "on-view-4" },
];

const thenPiece: Piece = { file: "then" };
const nowPiece: Piece = { file: "now" };

const galleries = [
  {
    name: "Exhibitions",
    to: "/explore/exhibitions",
    body: "Walk through a story chapter by chapter, with images, documents and context at every stop.",
  },
  {
    name: "People",
    to: "/explore/people",
    body: "The individuals behind the history, in the setting they lived in.",
  },
  {
    name: "Events",
    to: "/explore/events",
    body: "The moments that turned things, and the evidence for what happened.",
  },
  {
    name: "Places",
    to: "/explore/places",
    body: "Cities, sites and landscapes where history was made.",
  },
  {
    name: "Artifacts",
    to: "/explore/artifacts",
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

function Plate({
  piece,
  className = "",
  eager = false,
}: {
  piece: Piece;
  className?: string;
  eager?: boolean;
}) {
  const src = findImage(piece.file);

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {src ? (
        <img
          src={src}
          alt={piece.alt ?? piece.title ?? ""}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <p className="absolute bottom-4 left-4 text-label text-ink/60">
          {piece.file}
        </p>
      )}
    </div>
  );
}

/** Museum-label caption. Only shows once the piece has a title. */
function Label({
  tag,
  piece,
  className = "",
}: {
  tag: string;
  piece: Piece;
  className?: string;
}) {
  if (!piece.title) return null;

  return (
    <figcaption className={`mt-4 ${className}`}>
      <div className="grid grid-cols-[3.5rem_1fr] gap-x-4 md:grid-cols-[4.5rem_1fr]">
        <span className="pt-1 text-label font-medium text-ochre">{tag}</span>
        <div>
          <p className="font-display text-heading-s leading-tight">
            {piece.title}
          </p>
          {piece.detail && (
            <p className="mt-1 text-body-s text-muted">{piece.detail}</p>
          )}
          {piece.credit && (
            <p className="mt-1 text-label text-muted">{piece.credit}</p>
          )}
        </div>
      </div>
    </figcaption>
  );
}

export default function About() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-ivory text-ink">
      {/* Opening: the one orchestrated moment on this page */}
      <section className="border-b border-line">
        <div className="container pb-12 pt-20 md:pb-16 md:pt-28 lg:pt-36">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
          >
            <h1 className="max-w-4xl font-display text-display-l leading-[0.92]">
              History is bigger than what made the textbook.
            </h1>

            <p className="mt-8 max-w-2xl text-body-l text-muted">
              REKÒ is a digital museum of Nigerian history and culture. Walk
              through exhibitions, look closely at objects, and read the
              sources behind every chapter.
            </p>
          </motion.div>
        </div>

        <figure className="pb-12 md:pb-16">
          <motion.div
            initial={reduce ? false : { clipPath: "inset(0% 14% 0% 14%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.4, ease, delay: 0.3 }}
          >
            <Plate
              piece={heroPiece}
              eager
              className="aspect-[4/3] w-full md:aspect-[16/7]"
            />
          </motion.div>

          <Label tag="No. 01" piece={heroPiece} className="container" />
        </figure>
      </section>

      {/* Galleries */}
      <section className="border-b border-line">
        <div className="container py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
            <h2 className="font-display text-heading-l leading-tight">
              Start in any room.
            </h2>
            <p className="max-w-xl text-body-m text-muted md:pt-3">
              REKÒ is arranged the way a museum is, by what you can look at.
              There is no right order.
            </p>
          </div>

          <ul className="mt-12 border-b border-line">
            {galleries.map((gallery) => (
              <li key={gallery.name}>
                <Link
                  to={gallery.to}
                  className="group grid gap-2 border-t border-line py-7 md:grid-cols-[1fr_2fr] md:items-baseline md:gap-24 md:py-9"
                >
                  <span className="font-display text-heading-l leading-tight transition-colors duration-300 group-hover:text-heritage-green">
                    {gallery.name}
                  </span>
                  <span className="max-w-xl text-body-m text-muted">
                    {gallery.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Principle: the dark room */}
      <section className="bg-deep-forest text-ivory">
        <div className="container py-20 md:py-28 lg:py-36">
          <h2 className="max-w-5xl font-display text-display-m leading-[0.98]">
            Every claim comes with its source. Where historians disagree, we
            say so.
          </h2>

          <p className="mt-8 max-w-2xl text-body-l text-ivory/75">
            We would rather you check us than trust us. Each chapter lists
            where its information comes from, and when the evidence supports
            more than one reading, you will see more than one.
          </p>
        </div>
      </section>

      {/* On view */}
      <section className="border-b border-line">
        <div className="container py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
            <h2 className="font-display text-heading-l leading-tight">
              On view
            </h2>
            <p className="max-w-xl text-body-m text-muted md:pt-3">
              Nigeria has hundreds of ethnic groups and languages, and no single
              exhibition can hold them all. Each one here follows a single
              thread in depth and names who is telling it.
            </p>
          </div>

          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {onView.map((piece, index) => {
              const tag = `No. ${String(index + 2).padStart(2, "0")}`;
              const content = (
                <figure>
                  <Plate piece={piece} className="aspect-[4/5] w-full" />
                  <Label tag={tag} piece={piece} />
                </figure>
              );

              return piece.to ? (
                <Link key={index} to={piece.to} className="block">
                  {content}
                </Link>
              ) : (
                <div key={index}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Then and now */}
      <section className="border-b border-line">
        <div className="container py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-24">
            <h2 className="font-display text-heading-l leading-tight">
              Then, and now
            </h2>
            <p className="max-w-xl text-body-m text-muted md:pt-3">
              Documents from the archive sit beside photographs taken in recent
              years, so you can see where one leads to the other.
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

      {/* How to use it */}
      <section className="border-b border-line">
        <div className="container py-20 md:py-28">
          <h2 className="font-display text-heading-l leading-tight">
            How to use REKÒ
          </h2>

          <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {ways.map((way) => (
              <div key={way.title} className="border-t border-line pt-6">
                <dt className="font-display text-heading-s leading-tight">
                  {way.title}
                </dt>
                <dd className="mt-3 max-w-md text-body-m text-muted">
                  {way.body}
                </dd>
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
            Begin with one object, one person or one year. Follow it for as
            long as it holds your interest.
          </p>

          <div className="mt-10">
            <ArrowLink to="/explore" className="text-ivory">
              Explore REKÒ
            </ArrowLink>
          </div>
        </div>
      </section>
    </div>
  );
}