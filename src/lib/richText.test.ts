// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { sanitizeStoryHtml, toPlainText } from "./richText";

const YOUTUBE = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";

function render(html: string) {
  const host = document.createElement("div");
  host.innerHTML = sanitizeStoryHtml(html);
  return host;
}

describe("sanitizeStoryHtml", () => {
  it("keeps a YouTube embed and puts it in a sandbox", () => {
    const iframe = render(
      `<p>Watch</p><iframe class="ql-video" src="${YOUTUBE}" allowfullscreen="true"></iframe>`,
    ).querySelector("iframe");

    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(YOUTUBE);
    expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
  });

  it.each([
    "https://evil.example/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
  ])("removes a frame pointing at %s", (src) => {
    expect(render(`<p>Hi</p><iframe src="${src}"></iframe>`).querySelector("iframe")).toBeNull();
  });

  it("keeps pictures that use a web address", () => {
    const img = render('<p><img src="https://cdn.example/a.jpg" alt="A market"></p>').querySelector("img");
    expect(img?.getAttribute("src")).toBe("https://cdn.example/a.jpg");
    expect(img?.getAttribute("alt")).toBe("A market");
  });

  it("removes base64 pictures and unsafe attributes", () => {
    const host = render(
      '<p>Hi</p><img src="data:image/png;base64,AAAA"><img src="https://cdn.example/a.jpg" onerror="window.hacked = true">',
    );

    expect(host.querySelectorAll("img")).toHaveLength(1);
    expect(host.querySelector("img[onerror]")).toBeNull();
  });

  it("still removes scripts and keeps links safe", () => {
    const host = render('<p><a href="https://example.com">x</a></p><script>window.hacked = true</script>');

    expect(host.querySelector("script")).toBeNull();
    expect(host.querySelector("a")?.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("toPlainText", () => {
  it("strips tags and keeps words apart", () => {
    expect(toPlainText("<p>First.</p><p>Second <strong>one</strong>.</p>")).toBe(
      "First. Second one.",
    );
  });

  it("leaves old plain text alone", () => {
    expect(toPlainText("One.\n\nTwo.")).toBe("One.\n\nTwo.");
  });

  it("handles nothing", () => {
    expect(toPlainText(null)).toBe("");
  });
});