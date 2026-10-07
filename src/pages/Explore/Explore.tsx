import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import exhibitionsImage from "../../assets/images/hero/benin2.jpg";
import peopleImage from "../../assets/images/hero/zik.jpg";
import eventsImage from "../../assets/images/hero/lagos3.jpg";
import placesImage from "../../assets/images/hero/Awhuhm.png";
import artifactsImage from "../../assets/images/hero/benin1.jpg";

const discoveryRoutes = [
  {
    number: "01",
    label: "Exhibitions",
    description: "Stories that unfold across time, place, and perspective.",
    to: "/explore/exhibitions",
    image: exhibitionsImage,
  },
  {
    number: "02",
    label: "People",
    description: "Meet the people behind Nigeria's stories.",
    to: "/explore/people",
    image: peopleImage,
  },
  {
    number: "03",
    label: "Events",
    description: "Trace the moments that changed things.",
    to: "/explore/events",
    image: eventsImage,
  },
  {
    number: "04",
    label: "Places",
    description: "Discover where history happened.",
    to: "/explore/places",
    image: placesImage,
  },
  {
    number: "05",
    label: "Artifacts",
    description: "Look closer at what survived.",
    to: "/explore/artifacts",
    image: artifactsImage,
  },
];

export default function Explore() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const activeRoute = discoveryRoutes[active];

  return (
    <div className="bg-ivory text-ink">
      {/* Cinematic entrance */}
      <section className="relative min-h-[75svh] overflow-hidden bg-ink text-ivory lg:min-h-[85svh]">
        <motion.img
          src={activeRoute.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={reduce ? false : { scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/20" />

        <div className="container relative flex min-h-[75svh] flex-col justify-end py-16 lg:min-h-[85svh] lg:py-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-5xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-sand">
              EXPLORE REKÒ
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-display-l leading-[0.9]">
              There is more than one way into the story.
            </h1>

            <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-meta text-ivory/65">
              {discoveryRoutes.map((route, index) => (
                <span key={route.label} className="flex items-center gap-4">
                  {route.label}
                  {index < discoveryRoutes.length - 1 && (
                    <span className="text-ivory/30">·</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Discovery index */}
      <section className="py-20 md:py-28 lg:py-40">
        <div className="container">
          <div className="mb-16 max-w-2xl md:mb-20">
            <p className="text-label font-medium tracking-[0.2em] text-ochre">
              CHOOSE YOUR PATH
            </p>

            <p className="mt-5 text-body-l text-muted">
              Follow a person, place, event, artifact, or exhibition. Every
              path leads somewhere else.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Route list */}
            <div className="lg:col-span-7">
              <div className="divide-y divide-line">
                {discoveryRoutes.map((route, index) => {
                  const isActive = active === index;

                  return (
                    <Link
                      key={route.to}
                      to={route.to}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="group block py-7 md:py-9"
                    >
                      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-5">
                        <span
                          className={[
                            "pt-2 text-meta transition-colors duration-300",
                            isActive
                              ? "text-ochre"
                              : "text-muted",
                          ].join(" ")}
                        >
                          {route.number}
                        </span>

                        <div>
                          <h2
                            className={[
                              "font-display text-heading-l leading-none transition-transform duration-500",
                              isActive ? "translate-x-2" : "",
                            ].join(" ")}
                          >
                            {route.label}
                          </h2>

                          <motion.p
                            initial={false}
                            animate={{
                              opacity: isActive ? 1 : 0.55,
                            }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 max-w-md text-body-s text-muted"
                          >
                            {route.description}
                          </motion.p>
                        </div>

                        <span
                          className={[
                            "pt-1 text-body-l transition-all duration-500",
                            isActive
                              ? "translate-x-0 text-heritage-green opacity-100"
                              : "-translate-x-2 opacity-30",
                          ].join(" ")}
                        >
                          →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Visual stage */}
            <div className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block lg:h-fit">
              <div className="relative aspect-[4/5] overflow-hidden bg-deep-forest">
                {discoveryRoutes.map((route, index) => (
                  <motion.img
                    key={route.image}
                    src={route.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={false}
                    animate={{
                      opacity: active === index ? 1 : 0,
                      scale: active === index ? 1 : 1.04,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))}

                <div className="absolute inset-0 bg-ink/15" />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-label tracking-[0.2em] text-sand">
                    {activeRoute.number}
                  </p>

                  <p className="mt-2 font-display text-heading-m text-ivory">
                    {activeRoute.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}