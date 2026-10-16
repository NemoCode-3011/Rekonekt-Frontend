import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useSplash } from "./splash-context";
import { milestones } from "./splashMilestones";
import { useSplashSequence } from "./useSplashSequence";

const EASE = [0.22, 1, 0.36, 1] as const;
const LAST = milestones.length - 1;

function Grain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
    >
      <filter id="splash-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>

      <rect width="100%" height="100%" filter="url(#splash-grain)" />
    </svg>
  );
}

export default function SplashScreen() {
  const { finishIntro, homeReady } = useSplash();
  const reduced = useReducedMotion() ?? false;
  const [showSkip, setShowSkip] = useState(false);

  const { year, reached, resting, showIdentity, skip } = useSplashSequence({
    reduced,
    homeReady,
    onFinish: finishIntro,
  });

  // The number on screen. There is no year 0, so 0 shows as 1.
  const number = useTransform(year, (v) => {
    const n = Math.round(v);
    return String(n === 0 ? 1 : Math.abs(n));
  });
  const era = useTransform(year, (v): string => (Math.round(v) < 0 ? "BCE" : "CE"));

  // Blur the number while it is moving fast. It goes sharp when it stops.
  const speed = useVelocity(year);
  const blur = useTransform(
    speed,
    (v) => `blur(${Math.min(Math.abs(v) / 400, 4)}px)`,
  );

  // How far along the line we are (0 to 1). The stops are spaced evenly,
  // even though the years between them are not.
  const progress = useTransform(
    year,
    milestones.map((m) => m.year),
    milestones.map((_, i) => i / LAST),
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [skip]);

  return createPortal(
    <motion.div
      role="region"
      aria-label="REKÒ introduction"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-ink text-ivory"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 46%, #0D1A13 0%, #070B08 72%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      exit={{ opacity: 0, transition: { duration: 0.55, ease: EASE } }}
    >
      <Grain />

      <div className="relative flex w-full flex-col items-center px-6">
        {/* Stage: the number and REKÒ take turns in this same box.
            The big font lives here so that "em" means the big size. */}
        <div className="relative h-[1.15em] w-full overflow-hidden whitespace-nowrap text-center font-display text-splash-year-sm leading-none tracking-tight text-ivory lining-nums tabular-nums md:text-splash-year">
          <AnimatePresence initial={false}>
            {!showIdentity && (
              <motion.div
                key="counter"
                className="absolute inset-0 flex items-center justify-center"
                style={{ filter: blur }}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : { y: "-100%", transition: { duration: 0.5, ease: EASE } }
                }
              >
                <span>
                  <motion.span>{number}</motion.span>
                  <motion.span className="ml-[0.12em] align-top font-sans text-[0.14em] font-medium tracking-[0.2em] text-sand">
                    {era}
                  </motion.span>
                </span>
              </motion.div>
            )}

            {showIdentity && (
              <motion.div
                key="reko"
                className="absolute inset-0 flex items-center justify-center tracking-[-0.03em]"
                initial={reduced ? { opacity: 0 } : { y: "100%" }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: reduced ? 0.3 : 0.7,
                    ease: EASE,
                    delay: reduced ? 0 : 0.1,
                  },
                }}
              >
                REKÒ
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Caption: the name of the stop, then the museum descriptor */}
        <div className="mt-7 flex h-10 items-center justify-center md:mt-9">
          <AnimatePresence mode="wait">
            {resting && !showIdentity && (
              <motion.div
                key={milestones[reached].id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.28, ease: EASE, delay: 0.1 },
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  transition: { duration: 0.15, ease: EASE },
                }}
              >
                <p className="font-sans text-label font-medium uppercase tracking-[0.26em] text-sand">
                  {milestones[reached].label}
                </p>

                <motion.span
                  aria-hidden
                  className="mt-4 block h-px w-16 bg-ochre md:w-24"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
                />
              </motion.div>
            )}

            {showIdentity && (
              <motion.p
                key="descriptor"
                className="max-w-[22ch] text-balance text-center font-sans text-label font-medium uppercase tracking-[0.24em] text-sand"
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.45,
                    ease: EASE,
                    delay: reduced ? 0 : 0.35,
                  },
                }}
              >
                Digital Museum of Nigerian History
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* The line of stops: it fills as the years pass, one dot per stop */}
        <div
          aria-hidden
          className="relative mt-10 h-px w-[min(70vw,28rem)] bg-ivory/15 md:mt-14"
        >
          <motion.div
            className="absolute inset-0 origin-left bg-ochre"
            style={{ scaleX: progress }}
          />

          {milestones.map((m, i) => (
            <span
              key={m.id}
              className={`absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                i <= reached ? "bg-ochre" : "bg-ivory/25"
              }`}
              style={{ left: `${(i / LAST) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Skip: sits in the corner of the screen, quiet and late */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            type="button"
            onClick={skip}
            aria-label="Skip introduction"
            className="absolute bottom-6 right-6 inline-flex min-h-11 min-w-11 items-center justify-center border border-ivory/25 px-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:border-ochre hover:text-ivory focus-visible:outline-ivory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}

/** Mounts the splash only while the intro is pending; AnimatePresence plays its exit. */
export function SplashLayer() {
  const { introDone } = useSplash();
  return <AnimatePresence>{!introDone && <SplashScreen key="splash" />}</AnimatePresence>;
}