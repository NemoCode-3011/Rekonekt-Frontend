import type {
  ExperienceArtifact,
  ExperienceEvent,
  ExperiencePerson,
  ExperiencePlace,
} from "../types";

// Mirrors the `stories` table.
export interface ExperienceStory {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
}

// A full record, ready to show in the drawer.
export type DiscoverySubject =
  | { kind: "person"; person: ExperiencePerson }
  | { kind: "place"; place: ExperiencePlace }
  | { kind: "event"; event: ExperienceEvent }
  | { kind: "artifact"; artifact: ExperienceArtifact }
  | { kind: "story"; story: ExperienceStory };

// A pointer to a record, used when we only know part of it (from search,
// for example). The backend looks up people, artifacts and stories by slug,
// and events and places by id.
export type DiscoveryRef =
  | { kind: "person"; slug: string }
  | { kind: "artifact"; slug: string }
  | { kind: "story"; slug: string }
  | { kind: "event"; id: number }
  | { kind: "place"; id: number };