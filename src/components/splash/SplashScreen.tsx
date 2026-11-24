import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useSplash } from "./splash-context";
import { useSplashSequence } from "./useSplashSequence";
import SplashMark from "./SplashMark";
import { RING, VIEWBOX } from "./splashArt";
import { IRIS_SECONDS, T } from "./splashTimeline";

const EASE = [0.22, 1, 0.36, 1] as const;
const IRIS_EASE = [0.6, 0, 0.25, 1] as const;

const WORD = ["R", "E", "K", "Ò"];
// Letterpress: no two letters sit quite level.
const LETTER_TILT = [-0.9, 0.6, -0.4, 0.8];

// Paper grain, so the page has a surface rather than a flat colour.
function Grain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13] mix-blend-multiply"
    >
      <filter id="splash-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
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
  const [isPresent, safeToRemove] = usePresence();

  const { started, skip } = useSplashSequence({
    reduced,
    homeReady,
    onFinish: finishIntro,
  });

  // The exit: the hollow of the O opens and grows until the home page fills the screen.
  const markRef = useRef<SVGSVGElement>(null);
  const holeCentre = useRef({ x: 0, y: 0 });
  const holeRadius = useMotionValue(0);
  const push = useMotionValue(1);
  const fade = useMotionValue(1);
  const mask = useTransform(
    holeRadius,
    (r) =>
      `radial-gradient(circle at ${holeCentre.current.x}px ${holeCentre.current.y}px, transparent ${r}px, #000 ${r + 1.5}px)`,
  );

  useEffect(() => {
    if (isPresent) return;
    const done = () => safeToRemove?.();

    if (reduced) {
      const fadeOut = animate(fade, 0, {
        duration: 0.4,
        ease: "easeOut",
        onComplete: done,
      });
      return () => fadeOut.stop();
    }

    // Start the opening exactly at the middle of the ring.
    const box = markRef.current?.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = box ? box.left + (box.width * RING.cx) / VIEWBOX : width / 2;
    const y = box ? box.top + (box.height * RING.cy) / VIEWBOX : height / 2;
    holeCentre.current = { x, y };

    const reach =
      Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 40;
    const options = { duration: IRIS_SECONDS, ease: IRIS_EASE };

    const opening = animate(holeRadius, reach, { ...options, onComplete: done });
    const closeIn = animate(push, 1.1, options);

    return () => {
      opening.stop();
      closeIn.stop();
    };
  }, [isPresent, safeToRemove, reduced, fade, holeRadius, push]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [skip]);

  const go = started || reduced;

  return createPortal(
    <motion.div
      role="region"
      aria-label="REKÒ introduction"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-ivory text-ink"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 42%, #F7F2E8 0%, #EBE2CF 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        opacity: fade,
        ...(isPresent ? {} : { maskImage: mask, WebkitMaskImage: mask }),
      }}
    >
      <Grain />

      <motion.div
        className="relative flex flex-col items-center px-6"
        style={{ scale: push }}
      >
        <SplashMark
          ref={markRef}
          started={started}
          reduced={reduced}
          className="aspect-square h-[min(42svh,20rem)] w-auto"
        />

        <p
          className="mt-3 flex font-display text-[clamp(2.75rem,11vw,5.25rem)] leading-none tracking-wider text-ink md:mt-5"
          aria-label="REKÒ"
        >
          {WORD.map((letter, i) => (
            <span
              key={letter}
              aria-hidden
              className="mb-[-0.1em] mt-[-0.3em] inline-block overflow-hidden pb-[0.1em] pt-[0.3em]"
            >
              <motion.span
                className="block"
                style={{ rotate: LETTER_TILT[i] }}
                initial={reduced ? false : { y: "118%" }}
                animate={go ? { y: "0%" } : undefined}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: T.wordmark + i * T.letterGap,
                }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </p>

        <motion.p
          className="mt-4 max-w-[26ch] text-balance text-center font-sans text-label font-medium uppercase tracking-[0.24em] text-ink/70 md:mt-5"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: EASE, delay: T.descriptor }}
        >
          Digital Museum of Nigerian History
        </motion.p>
      </motion.div>

      {/* Skip: sits in the corner of the screen, quiet and early enough to find. */}
      <AnimatePresence>
        {showSkip && isPresent && (
          <motion.button
            type="button"
            onClick={skip}
            aria-label="Skip introduction"
            className="absolute bottom-6 right-6 z-30 inline-flex min-h-11 min-w-11 items-center justify-center border border-ink/25 px-4 font-sans text-xs font-medium uppercase tracking-[0.18em] text-ink/75 transition-colors hover:border-ochre hover:text-ink focus-visible:outline-ink"
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

/** Mounts the splash only while the intro is pending; the splash plays its own exit. */
export function SplashLayer() {
  const { introDone } = useSplash();
  return (
    <AnimatePresence>
      {!introDone && <SplashScreen key="splash" />}
    </AnimatePresence>
  );
}