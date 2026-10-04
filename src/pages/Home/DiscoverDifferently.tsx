import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";
import {
  ArtifactsStage,
  EventsStage,
  PeopleStage,
  PlacesStage,
} from "./DiscoverStages";

const ease = [0.76, 0, 0.24, 1] as const;

const routes = [
  {
    key: "people",
    label: "People",
    line: "Meet the people behind the stories.",
    to: "/explore/people",
    link: "Explore People",
    env: "bg-sand text-ink",
    Stage: PeopleStage,
  },
  {
    key: "events",
    label: "Events",
    line: "Trace the moments that changed things.",
    to: "/explore/events",
    link: "Explore Events",
    env: "bg-deep-forest text-ivory",
    Stage: EventsStage,
  },
  {
    key: "places",
    label: "Places",
    line: "Discover where history happened.",
    to: "/explore/places",
    link: "Explore Places",
    env: "bg-heritage-green text-ivory",
    Stage: PlacesStage,
  },
  {
    key: "artifacts",
    label: "Artifacts",
    line: "Look closer at what survived.",
    to: "/explore/artifacts",
    link: "Explore Artifacts",
    env: "bg-ivory text-ink",
    Stage: ArtifactsStage,
  },
];

export default function DiscoverDifferently() {
  const reduce = useReducedMotion();
  const dur = reduce ? 0 : 0.9;

  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  function select(i: number) {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  }

  // The new stage wipes in over the old one (left to right)
  const wipe: Variants = {
    out: { clipPath: "inset(0% 100% 0% 0%)", transition: { duration: 0 } },
    in: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: dur, ease } },
    kept: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0 } },
  };

  const current = routes[active];

  return (
    <section className="bg-ivory py-24 lg:py-40">
      <div className="container">
        <p className="text-label font-medium tracking-widest text-heritage-green">
          DISCOVER DIFFERENTLY
        </p>

        <h2 className="mt-6 max-w-4xl font-display text-display-m leading-[1.02]">
          Where do you want to begin?
        </h2>

        {/* Tablet and desktop: route row + one stage */}
        <div className="mt-12 hidden grid-cols-4 border-b border-line md:grid lg:mt-16">
          {routes.map((route, i) => (
            <button
              key={route.key}
              type="button"
              aria-pressed={active === i}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              className={`relative py-5 text-left font-display text-heading-m leading-none transition-colors duration-300 ${
                active === i ? "text-ink" : "text-ink/35 hover:text-ink/60"
              }`}
            >
              {route.label}
              {active === i && (
                <motion.span
                  layoutId="route-underline"
                  transition={{ duration: dur * 0.6, ease }}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-heritage-green"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 hidden md:block lg:mx-auto lg:w-2/3">
          <div className="relative h-[480px] overflow-hidden border border-line lg:h-[560px]">
            {routes.map((route, i) => (
              <motion.div
                key={route.key}
                aria-hidden
                variants={wipe}
                initial={false}
                animate={i === active ? "in" : i === prev ? "kept" : "out"}
                style={{ zIndex: i === active ? 2 : i === prev ? 1 : 0 }}
                className={`absolute inset-0 ${route.env}`}
              >
                <route.Stage />
              </motion.div>
            ))}
          </div>

          <motion.div
            key={active}
            initial={reduce ? false : { clipPath: "inset(0% 100% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: dur * 0.8, ease }}
            className="mt-8"
          >
            <p className="max-w-md font-display text-heading-m leading-tight">
              {current.line}
            </p>
            <ArrowLink to={current.to} className="mt-6">
              {current.link}
            </ArrowLink>
          </motion.div>
        </div>

        {/* Phone: vertical editorial list, one stage open */}
        <ul className="mt-10 border-t border-line md:hidden">
          {routes.map((route, i) => (
            <li key={route.key} className="border-b border-line">
              <button
                type="button"
                onClick={() => select(i)}
                aria-expanded={active === i}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span
                  className={`font-display text-heading-m leading-none transition-colors duration-300 ${
                    active === i ? "text-ink" : "text-ink/35"
                  }`}
                >
                  {route.label}
                </span>
                <span
                  aria-hidden
                  className={`text-heading-s font-light transition-transform duration-300 ${
                    active === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {active === i && (
                <motion.div
                  initial={
                    reduce ? false : { clipPath: "inset(0% 0% 100% 0%)" }
                  }
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{ duration: dur * 0.8, ease }}
                  className="pb-8"
                >
                  <p className="font-display text-heading-s leading-tight">
                    {route.line}
                  </p>
                  <div
                    aria-hidden
                    className={`mt-5 h-[420px] overflow-hidden border border-line ${route.env}`}
                  >
                    <route.Stage />
                  </div>
                  <ArrowLink to={route.to} className="mt-6">
                    {route.link}
                  </ArrowLink>
                </motion.div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
