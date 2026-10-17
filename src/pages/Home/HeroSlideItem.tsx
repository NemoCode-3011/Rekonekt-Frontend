import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { HeroSlide } from "../../features/home/heroSlides";
import { PHOTO_TREATMENT, slideLook, wrap } from "../../features/home/heroCarouselMotion";

interface HeroSlideItemProps {
  slide: HeroSlide;
  /** Which place on the loop this slide sits in. */
  slot: number;
  /** How many places the loop has in total. */
  slotCount: number;
  /** True for the repeated copies that fill out the loop. */
  isDuplicate: boolean;
  /** Where the carousel currently is, in slides. Shared by every slide. */
  offset: MotionValue<number>;
  /** Called once the very first picture has loaded (or failed to). */
  onFirstImageReady?: () => void;
  reduceMotion: boolean;
}

// One picture in the strip. It reads its distance from the middle and turns
// that into position, tilt, size and fade. Nothing here re-renders while the
// strip moves, so the animation stays smooth.
function HeroSlideItem({
  slide,
  slot,
  slotCount,
  isDuplicate,
  offset,
  onFirstImageReady,
  reduceMotion,
}: HeroSlideItemProps) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Distance from the middle, in slides.
  const d = useTransform(offset, (current) => wrap(slot - current, slotCount));

  const x = useTransform(d, (value) => slideLook(value).x);
  const rotateY = useTransform(d, (value) => slideLook(value).rotateY);
  const scale = useTransform(d, (value) => slideLook(value).scale);
  const opacity = useTransform(d, (value) => slideLook(value).opacity);
  const zIndex = useTransform(d, (value) => slideLook(value).zIndex);
  const shade = useTransform(d, (value) => slideLook(value).shade);

  // A video only plays while its slide is near the middle.
  useMotionValueEvent(d, "change", (value) => {
    const video = videoRef.current;
    if (!video) return;

    const nearMiddle = Math.abs(value) < 1.6;
    if (nearMiddle && video.paused) video.play().catch(() => {});
    if (!nearMiddle && !video.paused) video.pause();
  });

  const isFirst = slot === 0;
  const showVideo = Boolean(slide.video) && !reduceMotion && !failed;

  const face = (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-heritage-green/40 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] ring-1 ring-ivory/15">
      {failed ? (
        // If a picture is missing, show a quiet green tile instead of a broken icon.
        <div className="h-full w-full bg-linear-to-br from-heritage-green/60 to-deep-forest" />
      ) : showVideo ? (
        <video
          ref={videoRef}
          src={slide.video}
          poster={slide.image}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="h-full w-full object-cover"
          style={{ filter: PHOTO_TREATMENT }}
        />
      ) : (
        <img
          ref={(el) => {
            // The image may already be loaded before React attaches to it.
            if (isFirst && el?.complete) onFirstImageReady?.();
          }}
          src={slide.image}
          alt={isDuplicate ? "" : slide.alt}
          width={900}
          height={1200}
          draggable={false}
          loading={isDuplicate ? "lazy" : "eager"}
          decoding="async"
          onLoad={isFirst ? onFirstImageReady : undefined}
          onError={() => {
            setFailed(true);
            if (isFirst) onFirstImageReady?.();
          }}
          className="h-full w-full object-cover"
          style={{ filter: PHOTO_TREATMENT }}
        />
      )}

      {/* Grounds the picture in the palette, bottom to top */}
      <div className="absolute inset-0 bg-linear-to-t from-deep-forest/55 via-transparent to-transparent" />

      {/* Slides further from the middle sink into the background */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-deep-forest"
        style={{ opacity: shade }}
      />
    </div>
  );

  return (
    <motion.div
      data-hero-slide
      aria-hidden={isDuplicate || undefined}
      className="absolute inset-0 m-auto h-[calc(var(--item-w)*1.333)] w-(--item-w)"
      style={{ x, rotateY, scale, opacity, zIndex }}
    >
      {slide.href ? (
        <Link
          to={slide.href}
          tabIndex={isDuplicate ? -1 : undefined}
          aria-label={slide.caption}
          className="block h-full w-full"
        >
          {face}
        </Link>
      ) : (
        face
      )}
    </motion.div>
  );
}

export default HeroSlideItem;