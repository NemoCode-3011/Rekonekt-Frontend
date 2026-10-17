import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { HeroSlide } from "../../features/home/heroSlides";
import { BACKDROP_FILTER } from "../../features/home/heroCarouselMotion";

const mediaClass = "absolute inset-0 h-full w-full scale-[1.4] object-cover";

// A video slide has no still picture, so its backdrop is the video itself.
// On a wide screen it plays, so the glow behind the page moves with it.
function BackdropVideo({ src }: { src: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (wide && !reduce) ref.current?.play().catch(() => {});
  }, [reduce]);

  return (
    <video
      ref={ref}
      src={`${src}#t=0.1`}
      muted
      loop
      playsInline
      preload="metadata"
      className={mediaClass}
      style={{ filter: BACKDROP_FILTER }}
    />
  );
}

function BackdropMedia({ slide }: { slide: HeroSlide }) {
  if (slide.image) {
    return (
      <img src={slide.image} alt="" className={mediaClass} style={{ filter: BACKDROP_FILTER }} />
    );
  }
  if (slide.video) return <BackdropVideo src={slide.video} />;
  return null;
}

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

// The room behind the hero: a huge, blurred, darkened copy of whichever
// picture is in the middle, which fades to the next one as the strip moves.
// The light from the screen spills into the room.
export default function HeroBackdrop({ slide }: { slide: HeroSlide | undefined }) {
  const reduce = useReducedMotion();
  const fade = reduce ? 0 : 1.4;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink">
      <AnimatePresence initial={false}>
        {slide && (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // The old picture holds until the new one has faded in over it,
            // so the room never goes dark in between.
            exit={{ opacity: 1 }}
            transition={{ duration: fade, ease: "easeInOut" }}
          >
            <BackdropMedia slide={slide} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keeps the words readable */}
      <div className="absolute inset-0 bg-ink/35" />
      {/* Darkens the corners, so the eye stays in the middle */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_42%,transparent_50%,rgba(23,25,20,0.7)_100%)]" />
      {/* Settles the bottom edge into the page */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/80 to-transparent" />
      <Grain />
    </div>
  );
}