import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";
import { getWonders } from "../../features/wonders/api";
import { wonderTypeLabel } from "../../features/wonders/types";
import awhum from "../../assets/images/hero/awhum-waterfall-and-cave1.png";
import obudu from "../../assets/images/hero/obudu5.jpg";
import agbokim from "../../assets/images/hero/Agbokim.jpg";

type Slide = {
  key: string;
  name: string;
  location: string;
  image: string;
  alt: string;
  href: string;
};

// Shown until the real hidden wonders arrive (or if none has a picture yet).
// They have no page of their own, so they lead to the hidden wonders page.
const fallbackSlides: Slide[] = [
  {
    key: "awhum",
    name: "Awhum Waterfall",
    location: "Enugu State",
    image: awhum,
    alt: "Awhum Waterfall, Enugu State",
    href: "/wonders",
  },
  {
    key: "obudu",
    name: "Obudu Cattle Ranch",
    location: "Cross River State",
    image: obudu,
    alt: "Obudu Cattle Ranch, Cross River State",
    href: "/wonders",
  },
  {
    key: "agbokim",
    name: "Agbokim Waterfalls",
    location: "Cross River State",
    image: agbokim,
    alt: "Agbokim Waterfalls, Cross River State",
    href: "/wonders",
  },
];

const MAX_SLIDES = 5;

const INTERVAL = 6000;

export default function HiddenWonders() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "100px" });
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);

  // The slides are real hidden wonders, each linking to its own page.
  useEffect(() => {
    let cancelled = false;

    getWonders()
      .then((items) => {
        if (cancelled) return;

        const real = items.flatMap((item): Slide[] =>
          item.cover_image_url
            ? [
                {
                  key: item.slug,
                  name: item.title,
                  location:
                    item.region ?? wonderTypeLabel(item.wonder_type) ?? "",
                  image: item.cover_image_url,
                  alt:
                    item.cover_image_alt ??
                    [item.title, item.region].filter(Boolean).join(", "),
                  href: `/wonders/${item.slug}`,
                },
              ]
            : [],
        );

        if (real.length > 0) {
          setSlides(real.slice(0, MAX_SLIDES));
          setActive(0);
        }
      })
      .catch(() => {
        // Keep the slides we already have.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduce || !inView || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, INTERVAL);

    return () => window.clearInterval(timer);
  }, [inView, reduce, slides.length]);

  const wonder = slides[active] ?? slides[0];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90svh] overflow-hidden bg-ink text-ivory lg:min-h-screen"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={wonder.key}
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={wonder.image}
            alt={wonder.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            initial={reduce ? { scale: 1 } : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 6,
              ease: "linear",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-ink/30" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-ink/10" />

      <div className="container relative flex min-h-[90svh] flex-col justify-end py-16 lg:min-h-screen lg:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-sand">
              HIDDEN WONDERS OF NIGERIA
            </p>

            <h2 className="mt-5 max-w-3xl font-display text-display-l leading-[0.95]">
              Some of Nigeria's most remarkable places are hiding in plain sight.
            </h2>

            <div className="mt-10">
              <p className="font-display text-heading-m leading-none">
                {wonder.name}
              </p>

              {wonder.location && (
                <p className="mt-2 text-meta uppercase tracking-widest text-sand">
                  {wonder.location}
                </p>
              )}
            </div>

            <ArrowLink
              to={wonder.href}
              className="mt-8 text-ivory"
            >
              Visit the wonder
            </ArrowLink>
          </motion.div>
        </AnimatePresence>

        {/* Wonder navigation */}
        <div className="mt-12 flex items-center gap-3">
          {slides.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${item.name}`}
              aria-current={active === index ? "true" : undefined}
              className="group flex items-center gap-2 py-2"
            >
              <span
                className={[
                  "h-px transition-all duration-500",
                  active === index
                    ? "w-12 bg-ivory"
                    : "w-6 bg-ivory/40 group-hover:bg-ivory/70",
                ].join(" ")}
              />
            </button>
          ))}

          <span className="ml-2 text-meta tracking-widest text-ivory/70">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}