import { useState } from "react";

interface WonderCoverProps {
  url: string | null;
  alt: string | null;
  title: string;
  className: string;
  /** Pictures at the very top of a page should load straight away. */
  priority?: boolean;
  /** With no picture, show a quiet tile ("tile") or nothing at all ("none"). */
  fallback?: "tile" | "none";
}

// A wonder's picture. If it is missing, or fails to load, a quiet tile (or
// nothing) is shown instead of a broken image.
export default function WonderCover({
  url,
  alt,
  title,
  className,
  priority = false,
  fallback = "tile",
}: WonderCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url || failedUrl === url) {
    if (fallback === "none") return null;

    return (
      <div
        aria-hidden="true"
        className={`flex items-end bg-sand/40 p-5 ${className}`}
      >
        <span className="font-display text-display-m leading-none text-ink/20">
          {title.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt ?? ""}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedUrl(url)}
      className={`object-cover ${className}`}
    />
  );
}