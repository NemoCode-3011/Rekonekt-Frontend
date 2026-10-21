import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSplash } from "../../components/splash/splash-context";
import { heroSlides } from "../../features/home/heroSlides";
import HeroBackdrop from "./HeroBackdrop";
import HeroCarousel from "./HeroCarousel";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const { introDone, markHomeReady } = useSplash();
  const open = reduce || introDone;

  // Which slide is in the middle. The background shows that photo.
  const [activeIndex, setActiveIndex] = useState(0);

  // With no slides there is no picture to wait for, so don't hold the splash screen.
  useEffect(() => {
    if (heroSlides.length === 0) markHomeReady();
  }, [markHomeReady]);

  // Fades and lifts an element in once the intro has finished.
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: open ? 1 : 0, y: open ? 0 : 20 },
    transition: { duration: 0.9, ease, delay },
  });

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden pb-4 pt-24 text-ivory [@media(max-height:700px)]:pt-[5.25rem]">
      <HeroBackdrop slide={heroSlides[activeIndex]} />

      {/* The words: a label, the headline, one line and one button, centred */}
      <div className="container relative z-20 flex flex-col items-center text-center">
        <motion.p
          className="mb-4 text-label font-medium uppercase tracking-[0.22em] text-sand"
          {...reveal(0.3)}
        >
          A digital museum of Nigerian history
        </motion.p>

        {/* The headline rises out of a mask once the intro has finished */}
        <div className="overflow-hidden pb-[0.08em]">
          <motion.h1
            className="font-display text-[clamp(1.75rem,min(4.6vw,6.2svh),4.25rem)] leading-[1.02] tracking-tight"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: open ? 0 : "105%" }}
            transition={{ duration: 1, ease, delay: 0.5 }}
          >
            <span className="block">Know Your Roots.</span>
            <span className="block">Own Your Future.</span>
          </motion.h1>
        </div>

        <motion.p
          className="mt-4 max-w-2xl text-body-m text-ivory/80 [@media(max-height:700px)]:hidden"
          {...reveal(1)}
        >
          REKÒ connects the people, places, events and objects behind Nigeria&rsquo;s stories.
        </motion.p>

        <motion.div className="mt-5" {...reveal(1.15)}>
          <Link
            to="/explore"
            className="group inline-flex h-12 items-center gap-4 rounded-full bg-ivory pl-7 pr-1.5 text-body-s font-medium text-ink transition-colors hover:bg-sand"
          >
            Explore REKÒ
            <span className="grid size-9 place-items-center rounded-full bg-ochre text-ivory transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* The curved strip rises in after the words. It fills whatever height is left
          under the words (container-type: size), and the strip works out its own
          size from that, so on most screens it fits inside the first screen.
          On a very short window the photos stop shrinking at a minimum size
          (6.5rem wide, the same number as --min-item in HeroCarousel.tsx), and the
          page scrolls a little instead. The min-height below is that minimum:
          6.5rem x the strip's --group number, plus 3rem for the caption. */}
      <motion.div
        className="relative z-10 min-h-[calc(6.5rem_*_2.14_+_3rem)] flex-1 [container-type:size] sm:min-h-[calc(6.5rem_*_2.91_+_3rem)] lg:min-h-[calc(6.5rem_*_3.11_+_3rem)]"
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
    </section>
  );
}