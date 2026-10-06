export interface ExperienceSection {
  id: number;
  exhibition_id: number;
  title: string;
  slug: string;
  introduction: string;
  section_order: number;
  hero_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  sections: ExperienceSection[];
}


// (published events only, ordered by event_date, undated last).
export interface ExperienceEvent {
  id: number;
  section_id: number | null;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  date_display: string | null;
  image_url: string | null;
}

// Mirrors the `artifacts` table. Returned by GET /artifacts/sections/:sectionId.
export interface ExperienceArtifact {
  id: number;
  section_id: number | null;
  title: string;
  slug: string;
  artifact_type: string | null; // e.g. "Photograph", "Document"
  description: string | null;
  historical_context: string | null;
  date_display: string | null;
  place_id: number | null;
}

// Mirrors the `media` table (the actual files). Returned by GET /media.
export interface ExperienceMedia {
  id: number;
  title: string;
  media_type: "image" | "document" | "audio" | "video";
  file_url: string;
  caption: string | null;
  description: string | null;
  source_credit: string | null;
  license: string | null;
}

// artifact / person / place". Returned by GET /media-attachment.
export interface MediaAttachment {
  id: number;
  media_id: number;
  artifact_id: number | null;
  person_id: number | null;
  place_id: number | null;
  display_order: number | null;
}

// An artifact together with the files attached to it, in display order.
export interface ArtifactWithMedia extends ExperienceArtifact {
  media: ExperienceMedia[];
}

// Mirrors the `people` table.
export interface ExperiencePerson {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  birth_date: string | null;
  death_date: string | null;
}

// Mirrors the `places` table. Postgres DECIMAL values arrive as text.
export interface ExperiencePlace {
  id: number;
  name: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
}

// A source, as returned by GET /source-links/content/:type/:id.
export interface ExperienceSource {
  id: number;
  title: string;
  author: string | null;
  publication: string | null;
  source_type: string | null;
  publication_date: string | null; // already plain text: "YYYY-MM-DD"
  url: string | null;
  citation: string | null;
  rights_statement: string | null;
  perspective_note: string | null;
  relationship: string | null;
}

// What the side drawer can show.
export type DiscoverySubject =
  | { kind: "person"; person: ExperiencePerson }
  | { kind: "place"; place: ExperiencePlace };