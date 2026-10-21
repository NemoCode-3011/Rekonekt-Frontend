import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { HeroSlide } from "../../features/home/heroSlides";
import {
  BACKDROP_BLUR_PX,
  BACKDROP_DARKNESS,
  PHOTO_TREATMENT,
} from "../../features/home/heroCarouselMotion";

// A little bigger than the screen, so the softened edges are never visible.
const mediaClass = "absolute inset-0 h-full w-full scale-[1.06] object-cover";
const mediaStyle = { filter: `blur(${BACKDROP_BLUR_PX}px) ${PHOTO_TREATMENT}` };

// A video slide has no still picture, so its backdrop is the video itself.
// On a wide screen it plays, so the background moves with it.
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
      style={mediaStyle}
    />
  );
}

function BackdropMedia({ slide }: { slide: HeroSlide }) {
  if (slide.image) {
    return <img src={slide.image} alt="" className={mediaClass} style={mediaStyle} />;
  }
  if (slide.video) return <BackdropVideo src={slide.video} />;
  return null;
}

// The hero's background is the photo in the middle of the strip, under a dark
// overlay so the words and the strip stay readable. It fades to the next photo
// as the strip moves.
export default function HeroBackdrop({ slide }: { slide: HeroSlide | undefined }) {
  const reduce = useReducedMotion();
  const fade = reduce ? 0 : 1.2;

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
            // so the background never goes dark in between.
            exit={{ opacity: 1 }}
            transition={{ duration: fade, ease: "easeInOut" }}
          >
            <BackdropMedia slide={slide} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The overlay */}
      <div className="absolute inset-0 bg-ink" style={{ opacity: BACKDROP_DARKNESS }} />
      {/* Darkens the corners, so the eye stays in the middle */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(23,25,20,0.55)_100%)]" />
    </div>
  );
}
