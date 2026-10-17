// Everything you might want to tune in the hero carousel lives here.
// Change a number, save, and the carousel updates.

/** How fast the strip drifts by itself, in slides per second. 0 = still. */
export const DRIFT_SLIDES_PER_SECOND = 0.1;

/** Space between slides, as a multiple of one slide's width. */
export const STEP_RATIO = 1.08;

/**
 * How much each slide turns, per step away from the middle, in degrees.
 * Positive curves the strip towards you, like a wall around the viewer.
 * Negative curves it away from you, like a classic cover-flow.
 */
export const TILT_PER_STEP = 16;

/**
 * Size of the middle slide, and how much it changes per step away from the
 * middle. A negative number shrinks the slides on the sides, so the middle
 * one towers over them. Slides are lined up along their bottom edge.
 */
export const CENTER_SCALE = 1;
export const SCALE_PER_STEP = -0.1;

/** Tilt and size stop changing after this many steps from the middle. */
export const MAX_STEPS = 3;

/** Slides fade out completely between these two distances (in steps). */
export const FADE_START = 2.6;
export const FADE_END = 3.6;

/** How dark the slides furthest from the middle become (0 to 1). */
export const EDGE_SHADE = 0.55;

/**
 * How the blurred picture behind the hero looks. The sepia gives grey archive
 * photographs a warm glow instead of a dead grey. Make the blur smaller for a
 * sharper glow, or brightness bigger for a brighter room.
 */
export const BACKDROP_FILTER = "blur(70px) sepia(0.3) saturate(1.5) brightness(0.6)";

/**
 * A light, film-like warmth applied to every photo, so pictures from
 * different sources feel like one family. Set to "none" to turn it off.
 */
export const PHOTO_TREATMENT = "sepia(0.16) saturate(1.05) contrast(1.03)";

// ---------------------------------------------------------------------------

/** Keeps `value` between `min` and `max`. */
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * The slides sit on a loop. This turns any position into one between
 * -count/2 and +count/2, so a slide that leaves on one side
 * comes back in on the other.
 */
export function wrap(value: number, count: number) {
  return ((((value + count / 2) % count) + count) % count) - count / 2;
}

/**
 * How one slide looks, given its distance `d` from the middle
 * (measured in slides: 0 is the middle, -1 is one to the left).
 */
export function slideLook(d: number) {
  const steps = Math.min(Math.abs(d), MAX_STEPS);

  return {
    x: `${d * STEP_RATIO * 100}%`,
    rotateY: -Math.sign(d) * steps * TILT_PER_STEP,
    scale: CENTER_SCALE + steps * SCALE_PER_STEP,
    opacity: clamp(1 - (Math.abs(d) - FADE_START) / (FADE_END - FADE_START), 0, 1),
    zIndex: 100 - Math.round(Math.abs(d) * 10),
    shade: (steps / MAX_STEPS) * EDGE_SHADE,
  };
}