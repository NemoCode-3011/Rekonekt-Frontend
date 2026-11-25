import { WONDER_TYPES, wonderTypeLabel } from "../../wonders/types";
import type { AdminWonder } from "../api/wonders";
import type { FormField } from "./InlineForm";

// "6.37, 9.37" for the editor, or "" when the wonder has no map pin.
function location(wonder?: AdminWonder) {
  return wonder && wonder.latitude != null && wonder.longitude != null
    ? `${Number(wonder.latitude)}, ${Number(wonder.longitude)}`
    : "";
}

const typeField = (wonder?: AdminWonder): FormField => ({
  name: "wonderType",
  label: "What kind of wonder is it?",
  kind: "select",
  required: true,
  hint: "Pick the closest fit. It decides where visitors find it.",
  options: WONDER_TYPES.map((type) => ({
    value: type,
    label: wonderTypeLabel(type) ?? type,
  })),
  initial: wonder?.wonder_type ?? "place",
});

// The short form for starting a new wonder. The rest is filled in on the next page.
export function newWonderFields(): FormField[] {
  return [
    {
      name: "title",
      label: "Name",
      required: true,
      placeholder: "e.g. Obudu Plateau",
    },
    typeField(),
    {
      name: "summary",
      label: "Short summary",
      kind: "textarea",
      hint: "One or two sentences. Shown on the wonder's card.",
    },
  ];
}

// All the fields of a wonder, filled in from `wonder` when editing.
export function wonderFields(wonder?: AdminWonder): FormField[] {
  return [
    { name: "title", label: "Name", required: true, initial: wonder?.title },
    typeField(wonder),
    {
      name: "summary",
      label: "Short summary",
      kind: "textarea",
      hint: "One or two sentences (up to 600 characters). Shown on the wonder's card and under its title.",
      initial: wonder?.summary ?? "",
    },
    {
      name: "content",
      label: "About this wonder",
      kind: "richtext",
      hint: "Tell its story: what it is, why it matters, what to see or do. Use the toolbar for headings, lists, quotes and links.",
      initial: wonder?.content ?? "",
    },
    {
      name: "region",
      label: "Where in Nigeria",
      hint: "A state, town or area, for example Cross River State or Osogbo, Osun.",
      initial: wonder?.region ?? "",
    },
    {
      name: "location",
      label: "Map pin (optional)",
      placeholder: "6.3350, 5.6037",
      hint: "Paste coordinates, or a full Google Maps link. Leave empty if this wonder isn't tied to one spot, like a festival or a food.",
      initial: location(wonder),
    },
    {
      name: "coverImageUrl",
      label: "Cover image",
      kind: "image",
      hint: "The wide picture at the top of the wonder's page. A landscape photo works best.",
      initial: wonder?.cover_image_url ?? "",
    },
    {
      name: "coverImageAlt",
      label: "Cover image description",
      hint: "For people using a screen reader.",
      initial: wonder?.cover_image_alt ?? "",
    },
    {
      name: "imageCredit",
      label: "Cover image credit",
      hint: "The photographer, artist or archive.",
      initial: wonder?.cover_image_credit ?? "",
    },
    {
      name: "videoUrl",
      label: "Video link (optional)",
      placeholder: "https://www.youtube.com/watch?v=...",
      hint: "A YouTube link. It will appear on the wonder's page.",
      initial: wonder?.video_url ?? "",
    },
    {
      name: "references",
      label: "Learn more",
      kind: "links",
      hint: "Websites where visitors can find out more, for example the official site of a park, a museum or a festival. Add a short note about what they will find.",
      initial: JSON.stringify(
        (wonder?.references ?? []).map((reference) => ({
          label: reference.label,
          url: reference.url,
          note: reference.note ?? "",
        })),
      ),
    },
  ];
}