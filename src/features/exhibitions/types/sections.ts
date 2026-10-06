export interface Section {
  id: number;
  exhibition_id: number;
  title: string;
  slug: string;
  introduction: string | null;
  section_order: number;
  hero_image_url: string | null;
}