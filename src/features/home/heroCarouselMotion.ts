// Everything you might want to tune in the hero carousel lives here.
// Change a number, save, and the carousel updates.
//
// The slides hang in a curve, like the reference: the middle slide is
// smallest and flat, and the slides grow and turn inwards as they go
// outwards. Distances are in "slide widths", so the shape stays the same on
// every screen size.

// ---- Movement -------------------------------------------------------------

/**
 * "glide": rest on each photo for HOLD_SECONDS, then glide to the next.
 * "drift": move slowly and constantly, never resting.
 */
export const AUTOPLAY: "glide" | "drift" = "glide";

/** How long each photo rests in the middle ("glide" only). */
export const HOLD_SECONDS = 2.2;

/** How long the glide to the next photo takes ("glide" only). */
export const GLIDE_SECONDS = 1.1;

/** Speed of the constant movement, in slides per second ("drift" only). */
export const DRIFT_SLIDES_PER_SECOND = 0.1;

// ---- The curve ------------------------------------------------------------

/** How far the viewer stands from the strip. Smaller = a stronger curve. */
export const VIEWER_DISTANCE = 3.2;

/** Height of a slide, as a multiple of its width. */
export const SLIDE_HEIGHT = 1.42;

/**
 * Where a slide goes, by how many places it is from the middle (0 = the
 * middle, 1 = next to it, and so on). A slide between two places is blended
 * between them, which is what makes the glide smooth.
 *   x     how far from the middle, in slide widths
 *   turn  how far it turns to face the middle, in degrees
 *   scale how much bigger than the middle slide
 * These numbers were measured from the reference design.
 */
const PLACES = [
  { x: 0, turn: 0, scale: 1 },
  { x: 1.07, turn: 23, scale: 1.06 },
  { x: 2.28, turn: 57, scale: 1.31 },
  { x: 3.95, turn: 70, scale: 2.01 },
  { x: 6.5, turn: 72, scale: 2.7 }, // only a sliver at the edge of a wide screen
];

/** Slides fade out completely between these two places. They are off screen by then. */
export const FADE_START = 3.9;
export const FADE_END = 4.5;

// ---- Look -----------------------------------------------------------------

/**
 * A light, film-like warmth applied to every photo, so pictures from
 * different sources feel like one family. Set to "none" to turn it off.
 */
export const PHOTO_TREATMENT = "sepia(0.12) saturate(1.05) contrast(1.03)";

/** How much the photo behind the hero is softened, in pixels. 0 = sharp. */
export const BACKDROP_BLUR_PX = 5;

/** How dark the layer over the background photo is (0 = none, 1 = black). */
export const BACKDROP_DARKNESS = 0.6;

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
 * How one slide looks, given its distance `d` from the middle (measured in
 * slides: 0 is the middle, -1 is one to the left) and the width of a slide in pixels.
 */
export function slideLook(d: number, itemW: number) {
  const side = Math.sign(d);
  const places = clamp(Math.abs(d), 0, PLACES.length - 1);

  // Blend between the two places the slide is between.
  const lower = Math.min(Math.floor(places), PLACES.length - 2);
  const t = places - lower;
  const a = PLACES[lower];
  const b = PLACES[lower + 1];
  const blend = (from: number, to: number) => from + (to - from) * t;

  return {
    x: side * blend(a.x, b.x) * itemW,
    // Slides on the left turn one way, slides on the right the other.
    rotateY: -side * blend(a.turn, b.turn),
    scale: blend(a.scale, b.scale),
    opacity: clamp(1 - (Math.abs(d) - FADE_START) / (FADE_END - FADE_START), 0, 1),
    // Slides further out are bigger, so they sit on top.
    zIndex: Math.round(Math.abs(d) * 10),
  };
}