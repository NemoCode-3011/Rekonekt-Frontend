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