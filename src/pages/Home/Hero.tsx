import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSplash } from "../../components/splash/splash-context";
import { heroSlides } from "../../features/home/heroSlides";
import HeroBackdrop from "../../pages/Home/HeroBackdrop";
import HeroCarousel from "./HeroCarousel";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const { introDone, markHomeReady } = useSplash();
  const open = reduce || introDone;

  // Which slide is in the middle. The background takes its colour from it.
  const [activeIndex, setActiveIndex] = useState(0);

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
    <section
      // --hl is the size of the headline. The strip below is pulled up by a
      // share of it, so the middle photo overlaps the bottom of the letters.
      className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden pb-8 pt-24 text-ivory [--hl:clamp(2.75rem,min(9vw,12svh),9rem)] md:pt-28"
    >
      <HeroBackdrop slide={heroSlides[activeIndex]} />

      {/* The words sit behind the strip */}
      <div className="container relative z-0 flex flex-col items-center text-center">
        <motion.p
          className="text-label font-medium uppercase tracking-[0.22em] text-sand"
          {...reveal(0.3)}
        >
          A digital museum of Nigerian history
        </motion.p>

        {/* The headline rises out of a mask once the intro has finished */}
        <div className="mt-4 overflow-hidden pb-[0.08em]">
          <motion.h1
            className="font-display text-[length:var(--hl)] leading-[0.92] tracking-tight [text-shadow:0_4px_40px_rgba(0,0,0,0.35)]"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: open ? 0 : "105%" }}
            transition={{ duration: 1, ease, delay: 0.5 }}
          >
            <span className="block">Know Your Roots.</span>
            <span className="block">Own Your Future.</span>
          </motion.h1>
        </div>
      </div>

      {/* The strip rises in after the words, and overlaps them a little */}
      <motion.div
        className="relative z-10 -mt-[calc(var(--hl)*0.3)]"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 40 }}
        transition={{ duration: 1.4, ease, delay: 1.2 }}
      >
        <HeroCarousel
          slides={heroSlides}
          onFirstImageReady={markHomeReady}
          onActiveChange={setActiveIndex}
        />
      </motion.div>

      {/* The line of explanation and the two buttons */}
      <motion.div
        className="container relative z-10 mt-6 flex flex-col items-center gap-5 lg:flex-row lg:justify-between"
        {...reveal(1.5)}
      >
        <p className="max-w-md text-center text-body-s text-ivory/80 lg:text-left [@media(max-height:560px)]:hidden">
          Nigerian history is scattered across books, archives and half-remembered stories. REKÒ
          connects the people, places, events and objects behind it — and shows you the evidence.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/explore"
            className="inline-flex h-12 items-center bg-ivory px-8 text-body-s font-medium text-ink transition-colors hover:bg-sand"
          >
            Explore REKÒ
          </Link>
          <Link
            to="/exhibitions/the-benin-empire"
            className="inline-flex h-12 items-center border border-ivory/40 px-8 text-body-s font-medium text-ivory transition-colors hover:bg-ivory/10"
          >
            Enter The Benin Empire
          </Link>
        </div>
      </motion.div>
    </section>
  );
}