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
      label: "Hero image",
      kind: "image",
      hint: "The wide picture at the top of the story page. A landscape photo works best.",
      initial: story?.cover_image_url ?? "",
    },
    {
      name: "coverImageAlt",
      label: "Hero image description",
      hint: "For people using a screen reader.",
      initial: story?.cover_image_alt ?? "",
    },
    {
      name: "imageCredit",
      label: "Hero image credit",
      hint: "The photographer, artist or archive.",
      initial: story?.cover_image_credit ?? "",
    },
    {
      name: "didYouKnowImageUrl",
      label: "Did you know image",
      kind: "image",
      hint: "A tall picture for the home page. Leave it empty to use the hero image instead.",
      initial: story?.did_you_know_image_url ?? "",
      creditField: "didYouKnowImageCredit"
    },
    {
      name: "didYouKnowImageAlt",
      label: "Did you know image description",
      hint: "For people using a screen reader.",
      initial: story?.did_you_know_image_alt ?? "",
    },
    {
      name: "didYouKnowImageCredit",
      label: "Did you know image credit",
      hint: "The photographer, artist or archive.",
      initial: story?.did_you_know_image_credit ?? "",
    },
    {
      name: "bodyImageUrl",
      label: "Story image",
      kind: "image",
      hint: "Shown inside the story, after the first few paragraphs.",
      initial: story?.body_image_url ?? "",
      creditField: "bodyImageCredit"
    },
    {
      name: "bodyImageAlt",
      label: "Story image description",
      hint: "For people using a screen reader.",
      initial: story?.body_image_alt ?? "",
    },
    {
      name: "bodyImageCredit",
      label: "Story image credit",
      hint: "The photographer, artist or archive.",
      initial: story?.body_image_credit ?? "",
    },
  ];
}
