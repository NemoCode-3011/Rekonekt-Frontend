
import image1 from "../../assets/images/hero/civilwar.jpeg";
import image2 from "../../assets/images/hero/about1.jpg";
import video1 from "../../assets/images/hero/herovideo2.mp4";
import image3 from "../../assets/images/hero/heroimage1.jpg";
import image4 from "../../assets/images/hero/heroimage3.jpg";
import image5 from "../../assets/images/hero/heroimage4.jpg";

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
    image: image1,
    alt: "Nigerian federal troops during the Nigerian Civil War",
    caption: "Ore, Nigeria, August 16, 1967",
  },
  {
    id: "slide-2",
    image: image5,
    alt: "Chief Obafemi Awolowo",
    caption: "Ibadan / Lagos, Nigeria, Circa 1960s",
  },
  {
    id: "slide-3",
    image:image3,
    alt: "Moremi Statue of Liberty",
    caption: "Palace of the Ooni of Ife, Ile-Ife, 2016",
  },
  {
    id: "slide-4",
    image: "",
    video: video1,
    alt: "Vibrant traditional drumming performance at a cultural outdoor venue.",
    caption: "By Alexander Oshiame, 2026",
  },
  {
    id: "slide-5",
    image: image4,
    alt: "Bronze Head of Queen Idia (Iyoba)",
    caption: "Ancient Kingdom of Benin, Early 16th Century",
  },
  {
    id: "slide-6",
    image: image2,
    alt: "Nigerian football supporters",
    caption: "Nigeria, Late 2010s / Early 2020s",
  },
];