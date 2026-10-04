import { motion, useReducedMotion, type Variants } from "framer-motion";
import archive from "../../assets/images/hero/ind61.jpg";

const stages = ["Discover", "Explore", "Connect", "Understand"];

const DRAW = 1.6; // seconds for the line to run through all four stages

const lineX: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: DRAW, ease: "linear" } },
};

const lineY: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: DRAW, ease: "linear" } },
};

// Each stage lights up as the line reaches it
const dot: Variants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.4, delay: (i / 4) * DRAW },
  }),
};

const word: Variants = {
  hidden: { opacity: 0.25 },
  show: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: (i / 4) * DRAW },
  }),
};

export default function AboutReko() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ivory py-24 lg:py-40">
      <div className="container">
        <p className="text-label font-medium tracking-widest text-heritage-green">
          ABOUT REKÒ
        </p>

        <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <h2 className="font-display text-display-l leading-[1.02] lg:col-span-9">
            History is bigger
            <br className="hidden md:block" /> than what made
            <br className="hidden md:block" /> the textbook.
          </h2>

          <p className="mt-10 max-w-reading text-body-l text-muted lg:col-span-4 lg:col-start-6 lg:mt-16">
            REKÒ is a digital space for discovering Nigeria through the people,
            places, events, objects, and stories that shaped it — and the
            connections between them.
          </p>
        </div>
        <figure className="ml-auto mr-[calc(-1*var(--gutter))] mt-12 w-4/5 md:w-1/2 lg:absolute lg:right-0 lg:top-24 lg:mr-0 lg:mt-0 lg:w-[30vw]">
          <div className="aspect-4/3 overflow-hidden bg-sand">
            <img
              src={archive}
              alt="A black and white archival photograph capturing a group of joyful Nigerian students and citizens marching down a London street on October 1, 1960. Many in the crowd are smiling, singing, and dancing. Several individuals wear traditional Nigerian attire, including agbadas, gele head ties, and wrapper cloths, while others are dressed in mid-century Western suits. In the background, some carry protest or celebratory signs, and classical stone buildings and a London bus stop indicator flank the street."
              loading="lazy"
              className="h-full w-full object-cover grayscale-50 sepia-[.35]"
            />
          </div>
          <figcaption className="mt-3 pr-5 text-meta text-muted lg:pr-8">
            Nigerian students and citizens celebrate Nigeria's Independence Day
            outside Nigeria House on Northumberland Avenue, London, October 1,
            1960. Photograph by William Vanderson/Fox Photos via Getty Images.
          </figcaption>
        </figure>

        <motion.div
          className="relative mt-20 lg:mt-32"
          initial={reduce ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          <motion.span
            aria-hidden
            variants={lineY}
            style={{ originY: 0 }}
            className="absolute bottom-3.5 left-[3px] top-3.5 w-px bg-heritage-green/40 md:hidden"
          />
          <motion.span
            aria-hidden
            variants={lineX}
            style={{ originX: 0 }}
            className="absolute inset-x-0 top-[3px] hidden h-px bg-heritage-green/40 md:block"
          />

          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {stages.map((stage, i) => (
              <li key={stage} className="relative pl-8 md:pl-0 md:pt-8">
                <motion.span
                  aria-hidden
                  custom={i}
                  variants={dot}
                  className="absolute left-0 top-[11px] size-[7px] rounded-full bg-heritage-green md:top-0"
                />
                <motion.span
                  custom={i}
                  variants={word}
                  className="block font-display text-heading-m leading-none"
                >
                  {stage}
                </motion.span>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
