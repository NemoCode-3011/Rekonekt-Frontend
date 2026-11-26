import { describe, expect, it } from "vitest";
import {
  countOfType,
  filterByType,
  hostOf,
  isYouTubeEmbed,
  mapLinkFor,
  pinOf,
  safeHttpUrl,
  typesPresent,
} from "./helpers";

describe("pinOf", () => {
  it("reads decimals that arrive as text", () => {
    expect(pinOf({ latitude: "6.3700000", longitude: "9.3800000" })).toEqual({
      latitude: 6.37,
      longitude: 9.38,
    });
  });

  it("reads plain numbers", () => {
    expect(pinOf({ latitude: 7.7827, longitude: 4.5418 })).toEqual({
      latitude: 7.7827,
      longitude: 4.5418,
    });
  });

  it("keeps a position at zero", () => {
    expect(pinOf({ latitude: 0, longitude: "0" })).toEqual({
      latitude: 0,
      longitude: 0,
    });
  });

  it("has no pin when either side is missing or blank", () => {
    expect(pinOf({ latitude: null, longitude: null })).toBeNull();
    expect(pinOf({ latitude: 6.3, longitude: null })).toBeNull();
    expect(pinOf({ latitude: "", longitude: "5.6" })).toBeNull();
    expect(pinOf({ latitude: "  ", longitude: "5.6" })).toBeNull();
  });

  it("has no pin for text that is not a number", () => {
    expect(pinOf({ latitude: "north", longitude: "5.6" })).toBeNull();
  });

  it("has no pin for a position that is off the globe", () => {
    expect(pinOf({ latitude: 91, longitude: 5 })).toBeNull();
    expect(pinOf({ latitude: 5, longitude: -181 })).toBeNull();
  });
});

describe("kinds of wonder", () => {
  const items = [
    { wonder_type: "festival" },
    { wonder_type: "place" },
    { wonder_type: "festival" },
    { wonder_type: "unknown-kind" },
  ];

  it("lists only the kinds that exist, in the usual order", () => {
    expect(typesPresent(items)).toEqual(["place", "festival"]);
  });

  it("counts a kind", () => {
    expect(countOfType(items, "festival")).toBe(2);
    expect(countOfType(items, "food")).toBe(0);
  });

  it("filters by kind, or keeps everything when none is chosen", () => {
    expect(filterByType(items, "festival")).toHaveLength(2);
    expect(filterByType(items, null)).toBe(items);
  });
});

describe("safeHttpUrl", () => {
  it("accepts web links", () => {
    expect(safeHttpUrl("https://obuduranch.com/visit")).toBe(
      "https://obuduranch.com/visit",
    );
    expect(safeHttpUrl("http://example.org")).toBe("http://example.org/");
  });

  it("rejects links that are not web pages", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<p>hi</p>")).toBeNull();
    expect(safeHttpUrl("mailto:someone@example.com")).toBeNull();
  });

  it("rejects text that is not an address", () => {
    expect(safeHttpUrl("obuduranch.com")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
  });
});

describe("hostOf", () => {
  it("shows the site without www", () => {
    expect(hostOf("https://www.obuduranch.com/visit")).toBe("obuduranch.com");
  });

  it("gives nothing for text that is not an address", () => {
    expect(hostOf("not a link")).toBeNull();
  });
});

describe("isYouTubeEmbed", () => {
  it("accepts the privacy-friendly embed address", () => {
    expect(
      isYouTubeEmbed("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    ).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isYouTubeEmbed(null)).toBe(false);
    expect(isYouTubeEmbed(undefined)).toBe(false);
    expect(isYouTubeEmbed("")).toBe(false);
    expect(isYouTubeEmbed("https://www.youtube.com/embed/abc")).toBe(false);
    expect(isYouTubeEmbed("http://www.youtube-nocookie.com/embed/abc")).toBe(
      false,
    );
    expect(isYouTubeEmbed("https://evil.example/embed/abc")).toBe(false);
    expect(
      isYouTubeEmbed("https://www.youtube-nocookie.com.evil.example/embed/a"),
    ).toBe(false);
    expect(isYouTubeEmbed("https://www.youtube-nocookie.com/watch?v=abc")).toBe(
      false,
    );
  });
});

describe("mapLinkFor", () => {
  it("opens the map with the wonder chosen", () => {
    expect(mapLinkFor("obudu-plateau")).toBe(
      "/wonders?view=map&wonder=obudu-plateau",
    );
  });
});