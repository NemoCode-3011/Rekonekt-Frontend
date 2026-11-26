export type BundleKind = "people" | "events" | "artifacts";

export interface BundleItem {
  id: number;
  slug: string;
  title: string;
  image_url: string | null;
}

export interface Bundle {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  cover_image_url: string | null;
  item_count: number;
  items: BundleItem[];
}