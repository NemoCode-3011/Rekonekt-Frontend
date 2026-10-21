import DOMPurify from "dompurify";
import { toParagraphs } from "./text";

// Open every link in a new tab, safely.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Stories written before the rich editor are plain text. Stories written with
// it are HTML. This tells them apart.
function isHtml(text: string) {
  return /^\s*<[a-z]/i.test(text);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Turns any saved story (old plain text or new HTML) into HTML.
export function toEditorHtml(text: string | null | undefined) {
  if (!text) return "";
  if (isHtml(text)) return text.replace(/&nbsp;/g, " ");
  return toParagraphs(text)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

// Makes saved story content safe to show on the public site.
export function sanitizeStoryHtml(text: string | null | undefined) {
  return DOMPurify.sanitize(toEditorHtml(text), {
    ALLOWED_TAGS: [
      "p", "br", "h2", "h3", "strong", "em", "u",
      "blockquote", "ul", "ol", "li", "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}