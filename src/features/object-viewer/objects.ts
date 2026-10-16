// Everything about each 3D object lives here. The viewer itself reads this file.
// Add another object by adding another entry to `objects`.

export type Vec3 = [number, number, number];

export interface ObjectSource {
  label: string;
  url: string;
}

export interface ObjectStory {
  id: string;
  label: string; // the short name that appears next to the marker
  eyebrow: string;
  title: string;
  body: string;
  sources: ObjectSource[];

  // Where the marker sits on the model, and which way that part of the object faces.
  // Open the viewer with ?calibrate=1, click the model, and copy these numbers.
  position: Vec3;
  normal?: Vec3;

  // true = hidden from visitors until you have checked it against the model.
  needsCheck?: boolean;
}

export interface ObjectConfig {
  key: string;
  exhibitionSlug: string; // which exhibition it belongs to
  sectionSlug: string; // the chapter that shows the "Examine the object" card

  eyebrow: string;
  title: string;
  subtitle: string;
  teaser: string;

  modelUrl: string; // in public/models, so /models/bronze-head.glb

  credit: {
    model: string; // who made the digital model, where from, which license
    original?: string; // the museum that holds the real object
  };

  stories: ObjectStory[];

  finale: {
    eyebrow: string;
    title: string;
    body: string;
    sources: ObjectSource[];
  };
}

const MET_HEAD = {
  label: "The Metropolitan Museum of Art: head of a queen mother",
  url: "https://www.metmuseum.org/art/collection/search/316614",
};

export const objects: ObjectConfig[] = [
  {
    key: "queen-mother-head",
    exhibitionSlug: "the-benin-empire",
    sectionSlug: "court-craft-and-contact",

    eyebrow: "Digital study model",
    title: "Commemorative Head of a Queen Mother",
    subtitle: "Edo peoples, Kingdom of Benin",
    teaser:
      "On an ancestral altar in Benin, a cast brass head stood for a queen mother. Come closer and look at what it tells us.",

    modelUrl: "/models/bronze-head.glb",

    credit: {
      model: "Benin Bronze Head (https://skfb.ly/ptKrO) by yugengen is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)"
    },

    stories: [
      {
        id: "crown",
        label: "The crown",
        eyebrow: "REGALIA",
        title: "A crown that points forward",
        body: "In Benin the iyoba, the mother of the oba, held privileges second only to the king's. Her commemorative heads are told apart from a king's by the forward-pointing peak of the coral-beaded crown.",
        sources: [MET_HEAD],
        position: [0, 1.43, 0.65],
        normal: [0, 0.35, 1],
      },
      {
        id: "forehead",
        label: "The forehead",
        eyebrow: "IDENTITY",
        title: "Marks that mean something",
        body: "Scarification was one way Benin sculptors showed identity. On the Penn Museum's bronze statue of the first iyoba, Idia, four vertical scars above each eyebrow mark her as female.",
        sources: [
          {
            label: "Penn Museum: A Famous Queen Mother from Benin",
            url: "https://www.penn.museum/sites/expedition/a-famous-queen-mother-from-benin/",
          },
        ],
        position: [0, 1.03, 0.65],
        normal: [0, 0.1, 1],
      },
      {
        id: "collar",
        label: "The collar",
        eyebrow: "DATING THE OBJECT",
        title: "The collar is a clue",
        body: "On documented heads the collar helps date the work. Earlier heads have thinner walls and a tight beaded collar that fits under the chin. Later ones are heavier, with a tall cylindrical collar that rises toward the lip.",
        sources: [MET_HEAD],
        position: [0, 0.34, 0.55],
        normal: [0, 0, 1],
      },
      {
        id: "tusk",
        label: "Behind the crown",
        eyebrow: "RITUAL USE",
        title: "A place for a tusk",
        body: "Some later queen-mother heads have a circular opening behind the peak of the crown. It held a carved ivory tusk. Heads like this furnished the altars of past queen mothers, just as heads of past kings furnished theirs.",
        sources: [MET_HEAD],
        position: [0, 1.5, -0.5],
        normal: [0, 0.3, -1],
        needsCheck: true, // switch to false once you have seen this on the model
      },
    ],

    finale: {
      eyebrow: "WHERE IS IT NOW?",
      title: "Objects like this left Benin in 1897",
      body: "In 1897 British forces captured Benin City and seized several thousand objects from the oba's compound. The Foreign Office later auctioned them to raise money, which scattered them into museums and private collections. Returns have begun: in 2022 Germany agreed to transfer ownership of more than 1,100 Benin objects, and in 2026 the University of Cambridge transferred ownership of 116.",
      sources: [
        {
          label: "Penn Museum: A Famous Queen Mother from Benin",
          url: "https://www.penn.museum/sites/expedition/a-famous-queen-mother-from-benin/",
        },
        {
          label: "University of Cambridge: Benin artefacts return",
          url: "https://www.cam.ac.uk/stories/benin-artefacts-return",
        },
      ],
    },
  },
];

export const getObject = (key: string | undefined) =>
  objects.find((item) => item.key === key);

export const getObjectsFor = (exhibitionSlug: string, sectionSlug: string) =>
  objects.filter(
    (item) =>
      item.exhibitionSlug === exhibitionSlug &&
      item.sectionSlug === sectionSlug,
  );
