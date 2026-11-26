import { describe, expect, it } from "vitest";
import {
  isYouTubeEmbedUrl,
  toYouTubeEmbedUrl,
  youTubeIdFrom,
} from "./youtube";

const EMBED = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";

describe("toYouTubeEmbedUrl", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=abc",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "  https://youtu.be/dQw4w9WgXcQ  ",
  ])("turns %s into the embed address", (link) => {
    expect(toYouTubeEmbedUrl(link)).toBe(EMBED);
  });

  it.each([
    "",
    "not a link",
    "javascript:alert(1)",
    "https://vimeo.com/123456789",
    "https://evil.example/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/channel/UC1234567890",
  ])("rejects %s", (link) => {
    expect(toYouTubeEmbedUrl(link)).toBeNull();
  });
});

describe("youTubeIdFrom", () => {
  it("returns just the id", () => {
    expect(youTubeIdFrom("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});

describe("isYouTubeEmbedUrl", () => {
  it("accepts the privacy-friendly embed address", () => {
    expect(isYouTubeEmbedUrl(EMBED)).toBe(true);
  });

  it.each([
    null,
    undefined,
    "",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "http://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com.evil.example/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ/../x",
    "https://www.youtube-nocookie.com/watch?v=dQw4w9WgXcQ",
  ])("rejects %s", (value) => {
    expect(isYouTubeEmbedUrl(value)).toBe(false);
  });
});