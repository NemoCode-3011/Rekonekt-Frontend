const VIDEO_ID = /^[\w-]{11}$/;
const ID_PATHS = ["embed", "shorts", "live", "v"];

/** The 11-character video id inside a YouTube link, or null. */
export function youTubeIdFrom(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parts[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (parts[0] !== undefined && ID_PATHS.includes(parts[0])) {
      id = parts[1] ?? null;
    }
  }

  return id !== null && VIDEO_ID.test(id) ? id : null;
}

/**
 * Turns any normal YouTube link (watch, youtu.be, shorts, live, embed) into
 * the privacy-friendly embed address, or null if it isn't a YouTube video.
 */
export function toYouTubeEmbedUrl(value: string): string | null {
  const id = youTubeIdFrom(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/** True only for the exact embed address that toYouTubeEmbedUrl makes. */
export function isYouTubeEmbedUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    const id = url.pathname.replace(/^\/embed\//, "");
    return (
      url.protocol === "https:" &&
      url.hostname === "www.youtube-nocookie.com" &&
      url.pathname.startsWith("/embed/") &&
      VIDEO_ID.test(id)
    );
  } catch {
    return false;
  }
}