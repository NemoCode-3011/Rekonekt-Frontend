import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { HeroSlide } from "../../features/home/heroSlides";
import { DRIFT_SLIDES_PER_SECOND, STEP_RATIO } from "../../features/home/heroCarouselMotion";
import HeroSlideItem from "./HeroSlideItem";

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Called once the first picture has loaded, so the splash screen can leave. */
  onFirstImageReady?: () => void;
}

// Fades the two ends of the strip into the background.
const EDGE_FADE =
  "linear-gradient(to right, transparent, black 14%, black 86%, transparent)";

const arrowStyle =
  "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/30 text-ivory transition-colors hover:bg-ivory/10 sm:grid";

// A slowly drifting, curved strip of pictures.
//   - It drifts on its own, and stops when you hover, focus, drag or press pause.
//   - Drag or swipe it, or use the arrows or the left and right arrow keys.
//   - With "reduce motion" switched on, it never moves by itself.
function HeroCarousel({ slides, onFirstImageReady }: HeroCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const count = slides.length;
  // The strip is a loop. Repeat the slides until there are at least 10 places,
  // so nothing pops in or out where people can see it.
  const copies = Math.max(2, Math.ceil(10 / Math.max(count, 1)));
  const slotCount = count * copies;

  // Where the strip is, measured in slides. 0 = the first slide is in the middle.
  const offset = useMotionValue(0);

  const stripRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stripRef);

  const [userPaused, setUserPaused] = useState(false);
  const [active, setActive] = useState(0);

  const hovering = useRef(false);
  const tween = useRef<ReturnType<typeof animate> | null>(null);
  const drag = useRef<{ startX: number; startOffset: number; stepPx: number } | null>(null);
  const didDrag = useRef(false);

  // Which slide is in the middle? Used for the caption.
  useMotionValueEvent(offset, "change", (value) => {
    const index = ((Math.round(value) % count) + count) % count;
    setActive((previous) => (previous === index ? previous : index));
  });

  // The slow drift. It does nothing while the strip is off screen.
  useAnimationFrame((_, delta) => {
    const stopped =
      reduceMotion ||
      userPaused ||
      !inView ||
      hovering.current ||
      drag.current ||
      tween.current;
    if (stopped) return;

    // Cap the step so the strip doesn't jump after the tab was in the background.
    const seconds = Math.min(delta, 100) / 1000;
    offset.set(offset.get() + seconds * DRIFT_SLIDES_PER_SECOND);
  });

  function stopTween() {
    tween.current?.stop();
    tween.current = null;
  }

  // Move the strip by whole slides (arrows and keyboard).
  function goBy(amount: number) {
    stopTween();
    const target = Math.round(offset.get()) + amount;

    if (reduceMotion) {
      offset.set(target);
      return;
    }

    tween.current = animate(offset, target, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        tween.current = null;
      },
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") goBy(-1);
    if (event.key === "ArrowRight") goBy(1);
  }

  // Dragging and swiping.
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    stopTween();
    didDrag.current = false;

    const firstSlide = stripRef.current?.querySelector<HTMLElement>("[data-hero-slide]");
    drag.current = {
      startX: event.clientX,
      startOffset: offset.get(),
      stepPx: (firstSlide?.offsetWidth ?? 240) * STEP_RATIO,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;

    const moved = event.clientX - drag.current.startX;
    if (Math.abs(moved) > 6) didDrag.current = true;

    offset.set(drag.current.startOffset - moved / drag.current.stepPx);
  }

  function endDrag() {
    drag.current = null;
  }

  const current = slides[active] ?? slides[0];
  if (!current) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Photographs of Nigeria"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocus={() => (hovering.current = true)}
      onBlur={() => (hovering.current = false)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        <div
          ref={stripRef}
          // --item-w is the width of one slide. It also limits itself by the
          // screen's height, so the whole hero fits on a laptop.
          className="relative h-[calc(var(--item-w)*1.5)] w-full touch-pan-y select-none [--item-w:min(56vw,36svh)] sm:[--item-w:min(28vw,32svh)] lg:[--item-w:min(17vw,380px,27svh)]"
          style={{
            perspective: "1100px",
            WebkitMaskImage: EDGE_FADE,
            maskImage: EDGE_FADE,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          // A drag should not count as a click on a slide's link.
          onClickCapture={(event) => {
            if (didDrag.current) {
              event.preventDefault();
              event.stopPropagation();
              didDrag.current = false;
            }
          }}
        >
          {Array.from({ length: slotCount }, (_, slot) => (
            <HeroSlideItem
              key={slot}
              slide={slides[slot % count]}
              slot={slot}
              slotCount={slotCount}
              isDuplicate={slot >= count}
              offset={offset}
              onFirstImageReady={onFirstImageReady}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goBy(-1)}
          aria-label="Previous photograph"
          className={`${arrowStyle} left-4 lg:left-10`}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goBy(1)}
          aria-label="Next photograph"
          className={`${arrowStyle} right-4 lg:right-10`}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="container relative mt-6 flex min-h-12 justify-center">
        <div className="px-14 text-center" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
            >
              <span className="block text-body-s text-ivory">{current.caption}</span>
              {current.credit && (
                <span className="mt-1 block text-meta text-ivory/60">{current.credit}</span>
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {!reduceMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={userPaused}
            className="absolute right-(--gutter) top-0 grid size-10 place-items-center rounded-full border border-ivory/30 text-ivory transition-colors hover:bg-ivory/10"
          >
            {userPaused ? (
              <Play size={16} aria-hidden="true" />
            ) : (
              <Pause size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default HeroCarousel;