import { motion, useReducedMotion } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";

const ways = [
  {
    title: "Explore",
    body: "Browse exhibitions, people, events, places and artifacts. Start from anything that catches your attention.",
  },
  {
    title: "Experience",
    body: "Step inside an exhibition and move through it chapter by chapter, with images, documents and context along the way.",
  },
  {
    title: "Check the sources",
    body: "Every chapter lists where its information comes from, so you can follow the evidence yourself.",
  },
  {
    title: "Make it yours",
    body: "Create an account to bookmark what you find, keep notes and pick up where you left off.",
  },
];

export default function About() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-ivory text-ink">
      {/* Opening */}
      <section className="border-b border-line">
        <div className="container py-24 md:py-32 lg:py-40">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-ochre">
              ABOUT REKÒ
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-display-l leading-[0.92]">
              History is bigger than what made the textbook.
            </h1>

            <p className="mt-8 max-w-2xl text-body-l text-muted">
              REKÒ is a digital museum for Nigeria's history and culture: the
              people, places, events, artifacts and stories that shaped the
              country, and the ones still shaping it today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Principle */}
      <section className="border-b border-line">
        <div className="container grid gap-10 py-20 md:grid-cols-[1fr_2fr] md:gap-24 md:py-28">
          <p className="text-label font-medium tracking-[0.2em] text-ochre">
            OUR PRINCIPLE
          </p>

          <div>
            <p className="font-display text-heading-l leading-tight">
              REKÒ should make history easier to discover and harder to
              misunderstand.
            </p>
            <p className="mt-8 max-w-2xl text-body-m text-muted">
              That means showing evidence and context rather than simple
              verdicts. Where historians disagree, we say so. Where a claim
              rests on a source, we show you the source.
            </p>
          </div>
        </div>
      </section>

      {/* How to use it */}
      <section className="border-b border-line">
        <div className="container py-20 md:py-28">
          <p className="text-label font-medium tracking-[0.2em] text-ochre">
            HOW TO USE REKÒ
          </p>

          <dl className="mt-12 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {ways.map((way, index) => (
              <div key={way.title} className="border-t border-line pt-6">
                <dt className="font-display text-heading-m leading-tight">
                  <span className="mr-4 text-ochre">
                    {String(index + 1).padStart(2, "0")}
                  </span>
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

      {/* Invitation */}
      <section>
        <div className="container py-20 md:py-28">
          <p className="max-w-2xl font-display text-heading-l leading-tight">
            Know Your Roots. Own Your Future.
          </p>

          <div className="mt-10">
            <ArrowLink to="/explore">Explore REKÒ</ArrowLink>
          </div>
        </div>
      </section>
    </div>
  );
}
