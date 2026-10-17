
import placeholder1 from "../../assets/images/hero/fela11.jpg";
import placeholder2 from "../../assets/images/hero/ind60.jpg";
import placeholder3 from "../../assets/images/hero/aburi.jpg";
import placeholder4 from "../../assets/images/hero/benin1.jpg";
import placeholder5 from "../../assets/images/hero/Nig50.jpg";
import placeholder6 from "../../assets/images/hero/aburi2.jpg";

export interface HeroSlide {
  id: string;
  image: string;
  video?: string;
  alt: string;
  caption: string;
  credit?: string;
  href?: string;
}

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