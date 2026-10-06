// Splits text on line breaks into paragraphs, ignoring empty lines.
// Backend text fields use a line break to start a new paragraph.
export function toParagraphs(text: string | null | undefined) {
  return text?.split(/\n+/).filter(Boolean) ?? [];
}
