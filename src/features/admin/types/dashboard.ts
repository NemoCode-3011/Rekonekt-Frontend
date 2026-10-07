export interface DashboardBaseRecord {
  id: number;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardExhibition extends DashboardBaseRecord {
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  kind: "Exhibition";
}

export type DashboardExhibitionResponseItem = Omit<
  DashboardExhibition,
  "kind"
>;

export interface DashboardExhibitionsResponse {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  exhibitions: DashboardExhibitionResponseItem[];
  recentlyUpdated: DashboardExhibitionResponseItem[];
}

export type DashboardExhibitionSummary = Pick<
  DashboardExhibitionsResponse,
  "totalCount" | "publishedCount" | "draftCount" | "recentlyUpdated"
>;

export interface DashboardEvent extends DashboardBaseRecord {
  title: string;
  slug: string;
  section_id: number | null;
  description: string | null;
  event_date: string | null;
  date_display: string | null;
  image_url: string | null;
  kind: "Event";
}

export interface DashboardPerson extends DashboardBaseRecord {
  name: string;
  slug: string;
  description: string | null;
  birth_date: string | null;
  death_date: string | null;
  kind: "Person";
}

export interface DashboardPlace extends DashboardBaseRecord {
  name: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  kind: "Place";
}

export interface DashboardArtifact extends DashboardBaseRecord {
  title: string;
  slug: string;
  section_id: number | null;
  artifact_type: string | null;
  description: string | null;
  historical_context: string | null;
  date_display: string | null;
  place_id: number | null;
  kind: "Artifact";
}

export interface DashboardStory extends DashboardBaseRecord {
  title: string;
  slug: string;
  section_id: number | null;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  kind: "Story";
}

export interface DashboardSection {
  id: number;
  exhibition_id: number;
  title: string;
  slug: string;
  introduction: string | null;
  section_order: number;
  hero_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type DashboardRecord =
  | DashboardExhibition
  | DashboardEvent
  | DashboardPerson
  | DashboardPlace
  | DashboardArtifact
  | DashboardStory;

export interface DashboardCollections {
  exhibitions: DashboardExhibition[];
  events: DashboardEvent[];
  people: DashboardPerson[];
  places: DashboardPlace[];
  artifacts: DashboardArtifact[];
  stories: DashboardStory[];
}

export interface DashboardData {
  collections: {
    [K in keyof DashboardCollections]: DashboardCollection<
      DashboardCollections[K][number]
    >;
  };
  exhibitionSummary: DashboardExhibitionSummary | null;
  sections: DashboardSection[] | null;
  sectionsError: string | null;
}

export interface DashboardCollection<T> {
  items: T[] | null;
  error: string | null;
}

export type CreateContentKind =
  | "exhibition"
  | "event"
  | "person"
  | "place"
  | "artifact"
  | "story";

export interface CreateExhibitionInput {
  title: string;
  slug: string;
  startDate: string;
  subtitle?: string;
  description?: string;
  endDate?: string;
  coverImageUrl?: string;
}

export interface CreateEventInput {
  sectionId: number;
  title: string;
  slug: string;
  description?: string;
  eventDate?: string;
  dateDisplay?: string;
  imageUrl?: string;
}

export interface CreatePersonInput {
  name: string;
  slug: string;
  description?: string;
  birthDate?: string;
  deathDate?: string;
}

export interface CreatePlaceInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface CreateArtifactInput {
  sectionId: number;
  title: string;
  slug: string;
  artifactType: string;
  description?: string;
  historicalContext?: string;
  dateDisplay?: string;
  placeId?: number;
}

export interface CreateStoryInput {
  sectionId: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
}
