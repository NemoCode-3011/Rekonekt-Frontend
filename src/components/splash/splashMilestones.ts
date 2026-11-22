import nokImage from "../../assets/images/hero/nok.webp";
import igboUkwuImage from "../../assets/images/hero/optimized/egg-compressed.jpg";
import sokotoImage from "../../assets/images/hero/optimized/sokoto-compressed.jpg";
import amalgamationImage from "../../assets/images/hero/optimized/train50-compressed.jpg";
import independenceImage from "../../assets/images/hero/independence.webp";
import ifeImage from "../../assets/images/hero/ife.webp";
import republicImage from "../../assets/images/hero/1999.webp"

export type Milestone = {
  id: string;
  year: number; // negative means BCE
  label: string;
  holdMs: number; // how long the counter rests here before moving on
  image: string; // the picture that fills the screen at this stop
  focus?: string; // the part of the picture to keep in view, e.g. "center 30%"
};

// The stops along the way. Change holdMs to make a stop longer or shorter.
// To change a picture, change its import above.
//
// Two of these are stand-ins until the right pictures are found:
//   nok        the Jos Plateau landscape, where Nok culture lived
//   igbo-ukwu  a Benin bronze plaque (cast metalwork, but not Igbo-Ukwu itself)

export const milestones: Milestone[] = [
  { id: "nok", year: -620, label: "Nok Civilization", holdMs: 800, image: nokImage, focus: "center 50%" },
  { id: "igbo-ukwu", year: 900, label: "Igbo-Ukwu", holdMs: 700, image: igboUkwuImage, focus: "center 35%" },
  { id: "ife-benin", year: 1200, label: "Kingdom of Ife", holdMs: 700, image: ifeImage, focus: "center 50%" },
  { id: "sokoto", year: 1804, label: "Sokoto Caliphate", holdMs: 700, image: sokotoImage, focus: "center 40%" },
  { id: "amalgamation", year: 1914, label: "Amalgamation", holdMs: 700, image: amalgamationImage, focus: "center" },
  { id: "independence", year: 1960, label: "Independence", holdMs: 850, image: independenceImage, focus: "center 55%" },
  { id: "fourth-republic", year: 1999, label: "Fourth Republic", holdMs: 950, image: republicImage, focus: "center 30%" },
];
