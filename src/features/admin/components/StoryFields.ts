import { STORY_CATEGORIES, categoryLabel } from "../../stories/Category";
import type { AdminStory } from "../api/stories";
import type { FormField } from "./InlineForm";

// The fields of the story form. Used to create a story (empty) and to edit one
// (filled in from `story`).
export function storyFields(story?: AdminStory): FormField[] {
  return [
    { name: "title", label: "Title", required: true, initial: story?.title },
    {
      name: "category",
      label: "Category",
      kind: "select",
      options: [
        { value: "", label: "No category" },
        ...STORY_CATEGORIES.map((category) => ({
          value: category,
          label: categoryLabel(category) ?? category,
        })),
      ],
      initial: story?.category ?? "",
    },
    {
      name: "didYouKnow",
      label: "Did you know?",
      kind: "textarea",
      hint: "One or two sentences pulled from the story (10 to 300 characters). It becomes the headline on the home page.",
      initial: story?.did_you_know ?? "",
    },
    {
      name: "excerpt",
      label: "Short summary",
      kind: "textarea",
      hint: "Shown under the title and on the Stories page.",
      initial: story?.excerpt ?? "",
    },
    {
      name: "content",
      label: "Story",
      kind: "richtext",
      required: true,
      hint: "Use the toolbar for headings, bold, lists, quotes and links.",
      initial: story?.content ?? "",
    },
    {
      name: "coverImageUrl",
      label: "Cover image",
      kind: "image",
      hint: "Needed for the home page. It is also shown on the story's own page.",
      initial: story?.cover_image_url ?? "",
    },
    {
      name: "coverImageAlt",
      label: "Describe the image",
      hint: "For people using a screen reader.",
      initial: story?.cover_image_alt ?? "",
    },
    {
      name: "imageCredit",
      label: "Image credit",
      hint: "The photographer, artist or archive.",
      initial: story?.cover_image_credit ?? "",
    },
  ];
}
