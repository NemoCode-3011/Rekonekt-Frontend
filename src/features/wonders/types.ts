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

// A wonder as the browse page's cards see it (GET /wonders).
export interface WonderCard {
  id: number;
  title: string;
  slug: string;
  wonder_type: string;
  summary: string | null;
  region: string | null;
  // The database sends decimals as text, for example "6.3700000".
  latitude: string | number | null;
  longitude: string | number | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
  published_at: string | null;
}

// One "Learn more" link.
export interface WonderLink {
  id: number;
  label: string;
  url: string;
  note: string | null;
  display_order: number;
}

// A whole wonder (GET /wonders/:slug).
export interface WonderDetail extends WonderCard {
  content: string | null;
  video_url: string | null;
  // A safe youtube-nocookie address for the iframe, or null.
  video_embed_url: string | null;
  references: WonderLink[];
}

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