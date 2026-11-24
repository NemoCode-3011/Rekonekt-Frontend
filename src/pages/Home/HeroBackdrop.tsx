import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { HeroSlide } from "../../features/home/heroSlides";
import {
  BACKDROP_BLUR_PX,
  BACKDROP_DARKNESS,
  BACKDROP_STYLE,
  PHOTO_TREATMENT,
} from "../../features/home/heroCarouselMotion";

// A little bigger than the screen, so the softened edges are never visible.
const mediaClass = "absolute inset-0 h-full w-full scale-[1.06] object-cover";
const mediaStyle = { filter: `blur(${BACKDROP_BLUR_PX}px) ${PHOTO_TREATMENT}` };

// A video slide has no still picture, so its backdrop is the video itself.
// On a wide screen it plays, so the background moves with it.
function BackdropVideo({ src, style = mediaStyle }: { src: string; style?: CSSProperties }) {
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
      style={style}
    />
  );
}

function BackdropMedia({ slide, style = mediaStyle }: { slide: HeroSlide; style?: CSSProperties }) {
  if (slide.image) {
    return (
      <img
        src={slide.image}
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={mediaClass}
        style={style}
      />
    );
  }
  if (slide.video) return <BackdropVideo src={slide.video} style={style}/>
  return null;
}

// The hero's background is the photo in the middle of the strip, under a dark
// overlay so the words and the strip stay readable. It fades to the next photo
// as the strip moves.
function OriginalBackdrop({ slide }: { slide: HeroSlide | undefined }) {
  const reduce = useReducedMotion();
  const fade = reduce ? 0 : 1.2;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink"
    >
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
      <div
        className="absolute inset-0 bg-ink"
        style={{ opacity: BACKDROP_DARKNESS }}
      />
      {/* Darkens the corners, so the eye stays in the middle */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(23,25,20,0.55)_100%)]" />
    </div>
  );
}

// Solid ink with two very faint glows. No photo behind, so the strip is the star.
function InkBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink"
    >
      {/* A faint ochre glow low down, behind the photo strip */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_85%,rgba(166,106,63,0.22),transparent_70%)]" />
      {/* A very light sand wash at the top, so the headline area isn't a flat block */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_35%_at_50%_0%,rgba(216,199,169,0.07),transparent_70%)]" />
    </div>
  );
}

// Three soft blobs of colour, each drifting very slowly. Where they sit and how
// far they move is set here; their colours come from the slide's `tint`.
const BLOBS = [
  {
    left: "-15%",
    top: "-25%",
    size: "75vmax",
    x: [0, 70, 0],
    y: [0, 40, 0],
    seconds: 24,
  },
  {
    left: "40%",
    top: "10%",
    size: "65vmax",
    x: [0, -60, 0],
    y: [0, 50, 0],
    seconds: 28,
  },
  {
    left: "5%",
    top: "45%",
    size: "70vmax",
    x: [0, 50, 0],
    y: [0, -45, 0],
    seconds: 32,
  },
];

function AtmosphereBackdrop({ slide }: { slide: HeroSlide | undefined }) {
  const reduce = useReducedMotion();
  const fade = reduce ? 0 : 1.4;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink"
    >
      <AnimatePresence initial={false}>
        {slide && (
          <motion.div
            key={slide.id}
            className="absolute inset-0 opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            // The old colours hold until the new ones have faded in.
            exit={{ opacity: 0.7 }}
            transition={{ duration: fade, ease: "easeInOut" }}
          >
            {BLOBS.map((blob, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: blob.left,
                  top: blob.top,
                  width: blob.size,
                  height: blob.size,
                  background: `radial-gradient(circle at center, ${slide.tint[i]} 0%, transparent 65%)`,
                }}
                animate={reduce ? undefined : { x: blob.x, y: blob.y }}
                transition={{
                  duration: blob.seconds,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark at the top and bottom, so the headline and the strip stay readable */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(23,25,20,0.55),transparent_35%,transparent_60%,rgba(23,25,20,0.65))]" />
    </div>
  );
}

// A sharp photo (no blur), just with the shared colour treatment.
const sharpStyle = { filter: PHOTO_TREATMENT };

// A sharp, dimmed photo that zooms in very slowly, like a camera push-in.
function CinematicBackdrop({ slide }: { slide: HeroSlide | undefined }) {
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
            // The old photo holds until the new one has faded in over it.
            exit={{ opacity: 1 }}
            transition={{ duration: fade, ease: "easeInOut" }}
          >
            {/* The slow zoom. It starts again for every new photo. */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: reduce ? 1 : 1.12 }}
              transition={{ duration: 16, ease: "linear" }}
            >
              <BackdropMedia slide={slide} style={sharpStyle} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A dark layer over the whole photo */}
      <div className="absolute inset-0 bg-ink" style={{ opacity: 0.5 }} />
      {/* Heavy dark at the top and bottom, lighter in the middle */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(23,25,20,0.85),rgba(23,25,20,0.1)_30%,rgba(23,25,20,0.1)_55%,rgba(23,25,20,0.9))]" />
      {/* Darkens the corners */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(23,25,20,0.55)_100%)]" />
    </div>
  );
}

// Picks the background from BACKDROP_STYLE. The other looks get added here later.
export default function HeroBackdrop({ slide }: { slide: HeroSlide | undefined }) {
  if (BACKDROP_STYLE === "ink") return <InkBackdrop />;
  if (BACKDROP_STYLE === "atmosphere") return <AtmosphereBackdrop slide={slide} />;
  if (BACKDROP_STYLE === "cinematic") return <CinematicBackdrop slide={slide} />;
  return <OriginalBackdrop slide={slide} />;
}
