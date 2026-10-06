// One row from GET /progress: where a visitor is in one exhibition.
export interface ProgressEntry {
  id: number;
  exhibition_id: number;
  section_id: number | null;
  completed: boolean;
  last_viewed_at: string;
  exhibition_title: string;
  exhibition_slug: string;
  section_title: string | null;
  section_slug: string | null;
}