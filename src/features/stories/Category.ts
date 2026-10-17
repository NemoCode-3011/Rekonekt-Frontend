// Keep this in step with STORY_CATEGORIES in the backend
export const STORY_CATEGORIES = [
  "mythology",
  "folklore",
  "legend",
  "oral-history",
  "proverb",
  "tradition",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

const singular: Record<StoryCategory, string> = {
  mythology: "Mythology",
  folklore: "Folklore",
  legend: "Legend",
  "oral-history": "Oral history",
  proverb: "Proverb",
  tradition: "Tradition",
};


const plural: Record<StoryCategory, string> = {
  mythology: "Mythology",
  folklore: "Folklore",
  legend: "Legends",
  "oral-history": "Oral histories",
  proverb: "Proverbs",
  tradition: "Traditions",
};

export function isStoryCategory(value: string | null | undefined): value is StoryCategory {
  return STORY_CATEGORIES.some((category) => category === value);
}

/** "Folklore", or null when the story has no (or an unknown) category. */
export function categoryLabel(category: string | null | undefined) {
  return isStoryCategory(category) ? singular[category] : null;
}

/** "Legends", for the filter buttons. */
export function categoryPluralLabel(category: StoryCategory) {
  return plural[category];
}