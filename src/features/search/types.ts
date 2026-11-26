export type SearchResultType =
  | "exhibition"
  | "person"
  | "event"
  | "place"
  | "artifact"
  | "story"
  | "wonder";

// One row from GET /search?q=...
export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string;
  slug: string | null; // null when there is no page of its own
  summary: string | null;
}