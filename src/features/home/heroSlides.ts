// The pictures (and short videos) in the home page carousel.
// This is the only file you need to edit to change what the carousel shows.
//
// How to add your own:
//   1. Put the file in src/assets/images/hero/ (or src/assets/video/ for clips).
//   2. Import it below and add one object to the list.
//
// Tips for a warm, human feel:
//   - Aim for 5 to 8 slides, mostly people: faces, hands, movement.
//   - Portrait photos (3:4) fit best. Export about 900px wide as WebP.
//   - Captions work best as a place and a year, e.g. "Lagos, 1960".
//   - Videos: short (5-8 seconds), no sound, under about 2 MB. Always give
//     the video an `image` too, which is shown until it plays.

import placeholder1 from "../../assets/images/hero/fela11.jpg";
import placeholder2 from "../../assets/images/hero/ind60.jpg";
import placeholder3 from "../../assets/images/hero/aburi.jpg";
import placeholder4 from "../../assets/images/hero/benin1.jpg";
import placeholder5 from "../../assets/images/hero/Nig50.jpg";
import placeholder6 from "../../assets/images/hero/aburi2.jpg";

export interface HeroSlide {
  /** Any short unique name. */
  id: string;
  /** The picture. For a video slide, this is the still shown before it plays. */
  image: string;
  /** Optional short clip. Plays muted and looping when the slide is near the middle. */
  video?: string;
  /** Describes the picture for people using a screen reader. Required. */
  alt: string;
  /** Shown under the carousel when this slide is in the middle. */
  caption: string;
  /** Photographer or archive. Shown under the caption. */
  credit?: string;
  /** Optional page to open when the slide is clicked, e.g. "/people/ovonramwen". */
  href?: string;
}

// TEMPORARY stand-ins taken from images already in the project.
// Replace each one with your own photographs of traditional dance in Nigeria.
export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    image: placeholder1,
    alt: "People walking together in a street, some with their arms raised",
    caption: "Placeholder: add a place and a year",
  },
  {
    id: "slide-2",
    image: placeholder2,
    alt: "A young woman wearing a sash, surrounded by a smiling crowd",
    caption: "Placeholder: add a place and a year",
  },
  {
    id: "slide-3",
    image: placeholder3,
    alt: "Men greeting each other with a handshake",
    caption: "Placeholder: add a place and a year",
  },
  {
    id: "slide-4",
    image: placeholder4,
    alt: "A carved ivory mask from the Kingdom of Benin",
    caption: "Placeholder: add a place and a year",
    href: "/exhibitions/the-benin-empire",
  },
  {
    id: "slide-5",
    image: placeholder5,
    alt: "A crowded road with cars and people on foot",
    caption: "Placeholder: add a place and a year",
  },
  {
    id: "slide-6",
    image: placeholder6,
    alt: "Three men talking and eating together",
    caption: "Placeholder: add a place and a year",
  },
];