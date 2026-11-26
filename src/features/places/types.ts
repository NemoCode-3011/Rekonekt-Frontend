/** Public and admin place data returned by the Places API. */
export interface PlaceCard {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  region: PlaceRegion | null;
  category: PlaceCategory | null;
  latitude: string | number | null;
  longitude: string | number | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
}

export type PlaceCategory =
  | "sacred-site"
  | "palace"
  | "market"
  | "museum"
  | "landscape"
  | "monument"
  | "historic-town"
  | "festival-ground"
  | "other";

export const PLACE_REGIONS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Outside Nigeria",
] as const;

export type PlaceRegion = (typeof PLACE_REGIONS)[number];

export const PLACE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "sacred-site", label: "Sacred site" },
  { value: "palace", label: "Palace" },
  { value: "market", label: "Market" },
  { value: "museum", label: "Museum" },
  { value: "landscape", label: "Landscape" },
  { value: "monument", label: "Monument" },
  { value: "historic-town", label: "Historic town" },
  { value: "festival-ground", label: "Festival ground" },
  { value: "other", label: "Other" },
];

export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> =
  Object.fromEntries(
    PLACE_CATEGORIES.map(({ value, label }) => [value, label]),
  ) as Record<PlaceCategory, string>;

export interface PlaceFacets {
  regions: { value: PlaceRegion; count: number }[];
  categories: { value: PlaceCategory; count: number }[];
  total: number;
  pinned: number;
}

export interface PlaceEvent {
  id: number;
  title: string;
  slug: string;
  event_date: string | null;
  date_display: string | null;
  image_url: string | null;
}

export interface PlaceArtifact {
  id: number;
  title: string;
  slug: string;
  artifact_type: string | null;
  date_display: string | null;
}

export interface NearbyPlace {
  id: number;
  name: string;
  slug: string;
  region: PlaceRegion | null;
  category: PlaceCategory | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  distance_km: number | string;
}

export interface PlaceDetail extends PlaceCard {
  description: string | null;
  events: PlaceEvent[];
  artifacts: PlaceArtifact[];
  nearby: NearbyPlace[];
}
