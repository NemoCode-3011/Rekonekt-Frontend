// Keep this in step with WONDER_TYPES in the backend (validation/wonder.schema.ts).
// A hidden wonder can be almost anything worth discovering.
export const WONDER_TYPES = [
  "place",
  "landscape",
  "festival",
  "tradition",
  "food",
  "craft",
  "music",
  "architecture",
  "other",
] as const;

export type WonderType = (typeof WONDER_TYPES)[number];

const singular: Record<WonderType, string> = {
  place: "Place",
  landscape: "Landscape",
  festival: "Festival",
  tradition: "Tradition",
  food: "Food",
  craft: "Craft",
  music: "Music and dance",
  architecture: "Architecture",
  other: "Something else",
};

const plural: Record<WonderType, string> = {
  place: "Places",
  landscape: "Landscapes",
  festival: "Festivals",
  tradition: "Traditions",
  food: "Food",
  craft: "Crafts",
  music: "Music and dance",
  architecture: "Architecture",
  other: "Other wonders",
};

export function isWonderType(
  value: string | null | undefined,
): value is WonderType {
  return WONDER_TYPES.some((type) => type === value);
}

/** "Festival", or null when the type is missing or unknown. */
export function wonderTypeLabel(type: string | null | undefined) {
  return isWonderType(type) ? singular[type] : null;
}

/** "Festivals", for filter buttons. */
export function wonderTypePluralLabel(type: WonderType) {
  return plural[type];
}