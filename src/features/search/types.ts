export type SearchResultType =
  | "exhibition"
  | "person"
  | "event"
  | "place"
  | "artifact"
  | "story";

// One row from GET /search?q=...
export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string;
  slug: string | null; // places have none
  summary: string | null;
}