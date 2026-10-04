import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/hero/lekki-bridge.jpg";

const FOCUS = "object-[58%_60%]";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-dvh min-h-[600px] overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { clipPath: "inset(18% 22% 18% 22%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.6, ease }}
      >
        <motion.img
          src={heroImage}
          alt=""
          className={`h-full w-full object-cover ${FOCUS}`}
          initial={reduce ? false : { scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease }}
        />

        {/* Deep Forest tint, so the photo belongs to the palette */}
        <div className="absolute inset-0 bg-deep-forest/70 mix-blend-multiply" />

        {/* Darkness for type: bottom for the copy, top for the nav */}
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/50 to-transparent" />

        {/* Film grain */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14] mix-blend-overlay"
        >
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>
      </motion.div>

      {/* Type, anchored low-left in the image's negative space */}
      <div className="container relative z-10 flex h-full flex-col justify-end pb-12 lg:pb-24">
        {/* The headline rises out of a mask once the image has opened */}
        <div className="overflow-hidden pb-3">
          <motion.h1
            className="font-display text-display-xl leading-[0.95] text-ivory"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease, delay: 0.9 }}
          >
            <span className="block">Know Your Roots.</span>
            <span className="block">Own Your Future.</span>
          </motion.h1>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.7 }}
        >
          <p className="mt-6 max-w-xl text-body-l text-ivory/85">
            Discover the people, places, events, artifacts and stories that
            shaped Nigeria — and the ones still shaping it today.
          </p>

          <Link
            to="/explore"
            className="mt-8 inline-flex h-12 items-center bg-ivory px-8 text-body-s font-medium text-deep-forest transition-colors hover:bg-sand"
          >
            Explore REKÒ
          </Link>
        </motion.div>
      </div>
    </section>
  );
}