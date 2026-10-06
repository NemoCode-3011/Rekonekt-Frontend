export interface Exhibition {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}
