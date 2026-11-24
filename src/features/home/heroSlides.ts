
import image1 from "../../assets/images/hero/optimized/civilwar-optimized-compressed.jpg";
import image2 from "../../assets/images/hero/optimized/about1-optimized-compressed.jpg";
import video1 from "../../assets/images/hero/herovideo2.mp4";
import image3 from "../../assets/images/hero/lagos1.jpg";
import image4 from "../../assets/images/hero/about4.jpg";
import image5 from "../../assets/images/hero/people1.jpg";

export interface HeroSlide {
  id: string;
  image: string;
  video?: string;
  alt: string;
  caption: string;
  credit?: string;
  href?: string;
  /** Three colours for the background glow of this slide. */
  tint: [string, string, string];
}

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    image: image1,
    tint: ["#8A6A45", "#4A4332", "#B08A5A"],
    alt: "Nigerian federal troops during the Nigerian Civil War",
    caption: "Ore, Nigeria, August 16, 1967",
  },
  {
    id: "slide-2",
    image: image5,
    tint: ["#7A5C3E", "#3E3A2E", "#A68057"],
    alt: "Chief Obafemi Awolowo",
    caption: "Ibadan / Lagos, Nigeria, Circa 1960s",
  },
  {
    id: "slide-4",
    tint: ["#9E8F68", "#725838", "#C0A060"],
    image: "",
    video: video1,
    alt: "Vibrant traditional drumming performance at a cultural outdoor venue.",
    caption: "By Alexander Oshiame, 2026",
  },
  {
    id: "slide-3",
    image:image3,
    tint: ["#845D54", "#394D59", "#A66A3F"],
    alt: "Moremi Statue of Liberty",
    caption: "Palace of the Ooni of Ife, Ile-Ife, 2016",
  },
  {
    id: "slide-5",
    image: image4,
    tint: ["#7799B5", "#7D2D2C", "#472525"],
    alt: "Bronze Head of Queen Idia (Iyoba)",
    caption: "Ancient Kingdom of Benin, Early 16th Century",
  },
  {
    id: "slide-6",
    image: image2,
    tint: ["#1F6B50", "#567A5B", "#B8A07A"],
    alt: "Nigerian football supporters",
    caption: "Nigeria, Late 2010s / Early 2020s",
  },
];