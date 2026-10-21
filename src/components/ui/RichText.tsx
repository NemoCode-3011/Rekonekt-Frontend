import { useMemo } from "react";
import { sanitizeStoryHtml } from "../../lib/richText";

interface RichTextProps {
  html: string | null | undefined;
  className?: string;
}

// Shows story content. Works for old plain-text stories and new rich ones.
export default function RichText({ html, className = "" }: RichTextProps) {
  const clean = useMemo(() => sanitizeStoryHtml(html), [html]);
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}