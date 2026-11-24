// Every moment of the intro, in one place. Times are in seconds from the moment
// the intro starts. Change a number here and the whole piece follows.
export const T = {
  stitches: 2.0, // thread goes in once the last piece has landed
  stitchGap: 0.05, // from one stitch to the next along a crack
  seamGap: 0.07, // from one crack to the next
  accent: 2.5, // the accent is set on the O
  wordmark: 2.75, // REKÒ rises, one letter at a time
  letterGap: 0.08,
  descriptor: 3.35,
} as const;

export const HOLD_MS = 4200; // the intro may hand over to the home page after this
export const REDUCED_HOLD_MS = 1100; // for people who ask for less motion
export const READY_CAP_MS = 1400; // never wait longer than this for the home page
export const FONT_WAIT_MS = 250;
export const IRIS_SECONDS = 1.05; // how long the O takes to open onto the home page