import { http } from "../../../services/api/client";
import { clean, withSlug } from "./workspace";

type Values = Record<string, string>;
type Reply<T> = { message: string; data: T };

/** A story as the admin screens see it, drafts included. */
export interface AdminStory {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  did_you_know: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
  did_you_know_image_url: string | null;
  did_you_know_image_alt: string | null;
  did_you_know_image_credit: string | null;
  body_image_url: string | null;
  body_image_alt: string | null;
  body_image_credit: string | null;
  status: string;
  // The exhibition chapter the story is connected to. All four are null for a
  // standalone story.
  section_id: number | null;
  section_title: string | null;
  exhibition_id: number | null;
  exhibition_title: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

async function get<T>(path: string) {
  return (await http.get<Reply<T>>(path)).data.data;
}

export const listAdminStories = () => get<AdminStory[]>("/stories/admin");

export const getAdminStory = (id: number) =>
  get<AdminStory>(`/stories/admin/${id}`);

// Turns the form's values into what the backend expects. Empty fields are left out.
function body(values: Values) {
  return clean({
    title: values.title?.trim(),
    excerpt: values.excerpt?.trim(),
    content: values.content?.trim(),
    category: values.category,
    didYouKnow: values.didYouKnow?.trim(),
    coverImageUrl: values.coverImageUrl,
    coverImageAlt: values.coverImageAlt?.trim(),
    coverImageCredit: values.imageCredit?.trim(),
    didYouKnowImageUrl: values.didYouKnowImageUrl,
    didYouKnowImageAlt: values.didYouKnowImageAlt?.trim(),
    didYouKnowImageCredit: values.didYouKnowImageCredit?.trim(),
    bodyImageUrl: values.bodyImageUrl,
    bodyImageAlt: values.bodyImageAlt?.trim(),
    bodyImageCredit: values.bodyImageCredit?.trim(),
  });
}

/** Creates a standalone draft. Connect it to an exhibition later, if you want to. */
export function createAdminStory(values: Values) {
  return withSlug(values.title, async (slug) => {
    const res = await http.post<Reply<{ id: number }>>("/stories", {
      slug,
      ...body(values),
    });
    return res.data.data;
  });
}

/** Saves the details. The slug is not changed, so the story's address stays the same. */
export function updateAdminStory(id: number, values: Values) {
  return http.patch(`/stories/${id}`, body(values));
}

/** Connects the story to an exhibition chapter, or pass null to make it standalone. */
export function connectStory(id: number, sectionId: number | null) {
  return http.patch(`/stories/${id}`, { sectionId });
}

export function setStoryPublished(id: number, publish: boolean) {
  return http.patch(`/stories/${id}/${publish ? "publish" : "unpublish"}`);
}

export function deleteAdminStory(id: number) {
  return http.delete(`/stories/${id}`);
}
