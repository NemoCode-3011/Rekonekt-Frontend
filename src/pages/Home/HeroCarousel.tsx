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
import { Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { HeroSlide } from "../../features/home/heroSlides";
import {
  AUTOPLAY,
  DRIFT_SLIDES_PER_SECOND,
  GLIDE_SECONDS,
  HOLD_SECONDS,
  VIEWER_DISTANCE,
} from "../../features/home/heroCarouselMotion";
import HeroSlideItem from "./HeroSlideItem";

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Called once the first picture has loaded, so the splash screen can leave. */
  onFirstImageReady?: () => void;
  /** Called with the index of the slide in the middle, whenever it changes. */
  onActiveChange?: (index: number) => void;
}

// A strip of pictures hung in a curve (see heroCarouselMotion.ts). The middle one
// is smallest; the rest grow towards the edges of the screen.
//   - It rests on each photo, then glides to the next, all by itself. It stops
//     when you hover, focus, drag or press pause.
//   - Drag or swipe it, or use the left and right arrow keys.
//   - With "reduce motion" switched on, it never moves by itself.
function HeroCarousel({ slides, onFirstImageReady, onActiveChange }: HeroCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const count = slides.length;
  // The strip is a loop. Repeat the slides until there are at least 10 places,
  // so nothing pops in or out where people can see it.
  const copies = Math.max(2, Math.ceil(10 / Math.max(count, 1)));
  const slotCount = count * copies;

  // Where the strip is, measured in slides. 0 = the first slide is in the middle.
  const offset = useMotionValue(0);

  // The width of one slide in pixels. The size itself comes from CSS (--item-w);
  // it is measured here because the curve is worked out in pixels.
  const itemWidth = useMotionValue(0);
  const [itemW, setItemW] = useState(0);
  const probeRef = useRef<HTMLDivElement>(null);

  const stripRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stripRef);

  const [userPaused, setUserPaused] = useState(false);
  const [active, setActive] = useState(0);

  const hovering = useRef(false);
  const tween = useRef<ReturnType<typeof animate> | null>(null);
  const waited = useRef(0);
  const drag = useRef<{ startX: number; startOffset: number; stepPx: number } | null>(null);
  const didDrag = useRef(false);

  // Measure one slide's width, and again whenever the screen is resized.
  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;

    const read = () => {
      itemWidth.set(probe.offsetWidth);
      setItemW(probe.offsetWidth);
    };
    read();

    const observer = new ResizeObserver(read);
    observer.observe(probe);
    return () => observer.disconnect();
  }, [itemWidth]);

  // Which slide is in the middle? Used for the caption and the background.
  useMotionValueEvent(offset, "change", (value) => {
    const index = ((Math.round(value) % count) + count) % count;
    setActive((previous) => (previous === index ? previous : index));
  });

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  function stopTween() {
    tween.current?.stop();
    tween.current = null;
  }

  // Glide to a whole slide.
  function glideTo(target: number) {
    stopTween();
    waited.current = 0;

    if (reduceMotion) {
      offset.set(target);
      return;
    }

    tween.current = animate(offset, target, {
      duration: GLIDE_SECONDS,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        tween.current = null;
      },
    });
  }

  function goBy(amount: number) {
    glideTo(Math.round(offset.get()) + amount);
  }

  // The automatic movement. It does nothing while the strip is off screen.
  useAnimationFrame((_, delta) => {
    const stopped =
      reduceMotion || userPaused || !inView || hovering.current || drag.current || tween.current;
    if (stopped) return;

    // Cap the step so nothing jumps after the tab was in the background.
    const seconds = Math.min(delta, 100) / 1000;

    if (AUTOPLAY === "drift") {
      offset.set(offset.get() + seconds * DRIFT_SLIDES_PER_SECOND);
      return;
    }

    waited.current += seconds;
    if (waited.current >= HOLD_SECONDS) goBy(1);
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") goBy(-1);
    if (event.key === "ArrowRight") goBy(1);
  }

  // Dragging and swiping.
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    stopTween();
    didDrag.current = false;

    drag.current = {
      startX: event.clientX,
      startOffset: offset.get(),
      // About one slide's width of dragging moves the strip by one slide.
      stepPx: Math.max(itemW, 1) * 1.1,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;

    const moved = event.clientX - drag.current.startX;
    if (Math.abs(moved) > 6) didDrag.current = true;

    offset.set(drag.current.startOffset - moved / drag.current.stepPx);
  }

  function endDrag() {
    const wasDragging = drag.current !== null;
    drag.current = null;

    // After a drag, settle on the nearest photo.
    if (wasDragging && didDrag.current && AUTOPLAY === "glide") {
      glideTo(Math.round(offset.get()));
    }
  }

  const current = slides[active] ?? slides[0];
  if (!current) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Photographs of Nigeria"
      // The whole strip has to fit in the space the hero gives it, so nothing is cut off.
      //   --vw-cap  the widest a slide may be, as a share of the screen's width
      //   --group   the height of the strip plus the part that rises into the words,
      //             in slide widths
      //   --strip   the height of the strip, in slide widths: bigger screens show the
      //             tall slides at the sides, so they need more room
      //   --lift    how far the strip rises beside the button, in slide widths, so the
      //             middle slide ends up about 0.6 of a slide width below the button
      //   --min-item the smallest a slide may get, so photos never look squashed
      //   --item-w  the width of one slide: as wide as the cap allows, or as the space left
      //             allows (100cqh is the height of the space the hero gives the strip),
      //             but never less than --min-item
      // If there is room to spare, the strip is centred in it.
      className="absolute inset-x-0 [--min-item:6.5rem] [--group:2.14] [--lift:0.16] [--strip:2.3] [--vw-cap:28vw] sm:[--group:2.91] sm:[--lift:0.29] sm:[--strip:3.2] sm:[--vw-cap:15vw] lg:[--group:3.11] lg:[--lift:0.49] lg:[--strip:3.6] lg:[--vw-cap:10vw]"
      style={
        {
          "--item-w":
            "max(var(--min-item), min(var(--vw-cap), calc((100cqh - 3rem) / var(--group))))",
          top: "calc(max(0px, (100cqh - var(--item-w) * var(--group) - 3rem) / 2) - var(--item-w) * var(--lift))",
        } as CSSProperties
      }
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocus={() => (hovering.current = true)}
      onBlur={() => (hovering.current = false)}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={stripRef}
        className="relative w-full touch-pan-y select-none"
        style={{
          height: "calc(var(--item-w) * var(--strip))",
          // How far away the viewer stands, in pixels.
          perspective: itemW * VIEWER_DISTANCE || undefined,
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
        {/* Invisible. It is only here so the width of a slide can be measured. */}
        <div
          ref={probeRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 h-px w-(--item-w)"
        />

        {itemW > 0 &&
          Array.from({ length: slotCount }, (_, slot) => (
            <HeroSlideItem
              key={slot}
              slide={slides[slot % count]}
              slot={slot}
              slotCount={slotCount}
              isDuplicate={slot >= count}
              offset={offset}
              itemWidth={itemWidth}
              onFirstImageReady={onFirstImageReady}
              reduceMotion={reduceMotion}
            />
          ))}
      </div>

      <div className="container relative z-20 flex min-h-10 items-start justify-center">
        <div className="px-12 text-center" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-body-s text-ivory/90"
            >
              {current.caption}
              {current.credit && <span className="text-ivory/55"> · {current.credit}</span>}
            </motion.p>
          </AnimatePresence>
        </div>

        {!reduceMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={userPaused}
            className="absolute right-(--gutter) top-[-0.4rem] grid size-9 place-items-center rounded-full border border-ivory/30 text-ivory transition-colors hover:bg-ivory/10"
          >
            {userPaused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default HeroCarousel;