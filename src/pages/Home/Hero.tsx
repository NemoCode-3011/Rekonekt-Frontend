import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSplash } from "../../components/splash/splash-context";
import { heroSlides } from "../../features/home/heroSlides";
import HeroCarousel from "./HeroCarousel";

const ease = [0.76, 0, 0.24, 1] as const;

// The film-like grain over the background.
function Grain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay"
    >
      <filter id="hero-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const { introDone, markHomeReady } = useSplash();
  const open = reduce || introDone;

  // With no slides there is no picture to wait for, so don't hold the splash screen.
  useEffect(() => {
    if (heroSlides.length === 0) markHomeReady();
  }, [markHomeReady]);

  // Fades and lifts an element in once the intro has finished.
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: open ? 1 : 0, y: open ? 0 : 24 },
    transition: { duration: 0.9, ease, delay },
  });

  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-center gap-8 overflow-hidden bg-deep-forest pb-8 pt-24 text-ivory md:pt-28 lg:gap-10">
      {/* Background: Deep Forest, with a warm light behind the strip */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[75%]"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 72%, rgba(166, 106, 63, 0.32), rgba(166, 106, 63, 0) 70%)",
          }}
          animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Darkens the corners, so the eye stays in the middle */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(23,25,20,0.55)_100%)]" />
        <Grain />
      </div>

      <div className="container flex flex-col items-center text-center">
        <motion.p
          className="text-label font-medium uppercase tracking-[0.22em] text-sand"
          {...reveal(0.3)}
        >
          A digital museum of Nigerian history
        </motion.p>

        {/* The headline rises out of a mask once the intro has finished */}
        <div className="mt-5 overflow-hidden pb-2">
          <motion.h1
            className="font-display text-display-m leading-[0.98] text-ivory"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: open ? 0 : "105%" }}
            transition={{ duration: 1, ease, delay: 0.5 }}
          >
            <span className="block">Know Your Roots.</span>
            <span className="block">Own Your Future.</span>
          </motion.h1>
        </div>

        <motion.p
          className="mt-4 max-w-2xl text-body-m text-ivory/85"
          {...reveal(1)}
        >
          Nigerian history is scattered across books, archives and
          half-remembered stories. REKÒ connects the people, places, events and
          objects behind it — and shows you the evidence.
        </motion.p>

        <motion.div
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row"
          {...reveal(1.15)}
        >
          <Link
            to="/explore"
            className="inline-flex h-12 items-center bg-ivory px-8 text-body-s font-medium text-deep-forest transition-colors hover:bg-sand"
          >
            Explore REKÒ
          </Link>
        </motion.div>
      </div>

      {/* The strip rises in last, after the words */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 40 }}
        transition={{ duration: 1.4, ease, delay: 1.3 }}
      >
        <HeroCarousel slides={heroSlides} onFirstImageReady={markHomeReady} />
      </motion.div>
    </section>
  );
}