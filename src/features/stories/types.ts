
export interface StorySummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
  published_at: string | null;
}

/** A whole story, for its own page. */
export interface Story extends StorySummary {
  section_id: number | null;
  content: string | null;
  did_you_know: string | null;
}

/** The story of the day, for the home page. It always has a snippet and a picture. */
export interface DidYouKnowStory {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  did_you_know: string;
  cover_image_url: string;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
}