// One row from GET /bookmarks: a saved artifact, with its details attached.
export interface Bookmark {
  id: number;
  artifact_id: number;
  title: string;
  slug: string;
  artifact_type: string | null;
  description: string | null;
  date_display: string | null;
  created_at: string;
}