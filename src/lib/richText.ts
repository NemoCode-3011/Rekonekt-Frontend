import DOMPurify from "dompurify";
import { toParagraphs } from "./text";
import { isYouTubeEmbedUrl } from "./youtube";

// Links open in a new tab, safely. Pictures must be normal web addresses
// (never base64 data). The only frames allowed are YouTube videos, and they
// are put in a sandbox.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }

  if (node.tagName === "IMG") {
    const src = node.getAttribute("src") ?? "";
    if (!/^https?:\/\//i.test(src)) {
      node.remove();
      return;
    }
    node.setAttribute("loading", "lazy");
    node.setAttribute("decoding", "async");
  }

  if (node.tagName === "IFRAME") {
    if (!isYouTubeEmbedUrl(node.getAttribute("src"))) {
      node.remove();
      return;
    }
    node.setAttribute("title", "YouTube video");
    node.setAttribute("loading", "lazy");
    node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    node.setAttribute("allow", "encrypted-media; fullscreen; picture-in-picture");
    node.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation allow-popups",
    );
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
      "blockquote", "ul", "ol", "li", "a", "img", "iframe",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "allowfullscreen"],
  });
}

// Text only, for small cards and search results. Saved HTML loses its tags
// (a space is left between paragraphs); old plain text is returned as it is.
export function toPlainText(text: string | null | undefined) {
  if (!text) return "";
  if (!isHtml(text)) return text;

  const spaced = text.replace(
    /<\/(p|h[1-6]|li|blockquote|div)>|<br\s*\/?>/gi,
    " ",
  );
  const doc = new DOMParser().parseFromString(spaced, "text/html");
  doc.querySelectorAll("script, style, iframe").forEach((el) => el.remove());

  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

// Cuts a story's text in two, after the first `count` blocks (paragraphs,
// headings, lists...). It is used to put a picture inside the story.
// A story shorter than that comes back whole, with nothing in the second half.
export function splitStoryHtml(
  text: string | null | undefined,
  count: number,
): [string, string] {
  const html = sanitizeStoryHtml(text);
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");

  const hasLooseText = Array.from(doc.body.childNodes).some(
    (node) => node.nodeType === 3 && node.textContent?.trim(),
  );
  const blocks = Array.from(doc.body.children);

  if (hasLooseText || blocks.length <= count) return [html, ""];

  return [
    blocks.slice(0, count).map((block) => block.outerHTML).join(""),
    blocks.slice(count).map((block) => block.outerHTML).join(""),
  ];
}