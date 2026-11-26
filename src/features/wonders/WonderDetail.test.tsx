// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { WonderDetail as WonderData } from "../../features/wonders/types";

const apiMock = vi.hoisted(() => ({ getWonder: vi.fn() }));

vi.mock("../../features/wonders/api", () => apiMock);

import { ApiError } from "../../services/api/client";
import WonderDetail from "../../pages/Wonders/WonderDetail";

const wonder: WonderData = {
  id: 1,
  title: "Obudu Plateau",
  slug: "obudu-plateau",
  wonder_type: "landscape",
  summary: "A cool, misty plateau above the clouds.",
  region: "Cross River",
  latitude: "6.3700000",
  longitude: "9.3800000",
  cover_image_url: null,
  cover_image_alt: null,
  cover_image_credit: null,
  published_at: "2026-01-01T00:00:00.000Z",
  content:
    '<p>Take the cable car up.</p><script>window.hacked = true</script><img src="x" onerror="window.hacked = true">',
  video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  video_embed_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  references: [
    {
      id: 1,
      label: "Obudu Ranch",
      url: "https://obuduranch.com",
      note: "Opening times and prices",
      display_order: 0,
    },
    {
      id: 2,
      label: "Sneaky link",
      url: "javascript:alert(1)",
      note: null,
      display_order: 1,
    },
  ],
};

function renderPage(slug = "obudu-plateau") {
  return render(
    <MemoryRouter initialEntries={[`/wonders/${slug}`]}>
      <Routes>
        <Route path="/wonders/:slug" element={<WonderDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("hidden wonder page", () => {
  beforeEach(() => {
    apiMock.getWonder.mockReset();
  });

  afterEach(cleanup);

  it("shows the wonder's details", async () => {
    apiMock.getWonder.mockResolvedValue(wonder);
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Obudu Plateau", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A cool, misty plateau above the clouds."),
    ).toBeInTheDocument();
    expect(screen.getByText("Take the cable car up.")).toBeInTheDocument();
    expect(apiMock.getWonder).toHaveBeenCalledWith("obudu-plateau");
  });

  it("removes scripts and other unsafe markup from the story", async () => {
    apiMock.getWonder.mockResolvedValue(wonder);
    const { container } = renderPage();

    await screen.findByRole("heading", { name: "Obudu Plateau" });

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img[onerror]")).toBeNull();
  });

  it("embeds the YouTube video from the safe address", async () => {
    apiMock.getWonder.mockResolvedValue(wonder);
    renderPage();

    const video = await screen.findByTitle("Video about Obudu Plateau");
    expect(video).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("shows no video when there is no safe embed address", async () => {
    apiMock.getWonder.mockResolvedValue({
      ...wonder,
      video_embed_url: "https://evil.example/embed/abc",
    });
    renderPage();

    await screen.findByRole("heading", { name: "Obudu Plateau" });
    expect(screen.queryByTitle("Video about Obudu Plateau")).toBeNull();
  });

  it("opens learn-more links in a new tab and skips unsafe ones", async () => {
    apiMock.getWonder.mockResolvedValue(wonder);
    renderPage();

    const link = await screen.findByRole("link", { name: /Obudu Ranch/ });
    expect(link).toHaveAttribute("href", "https://obuduranch.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Opening times and prices")).toBeInTheDocument();
    expect(screen.queryByText("Sneaky link")).toBeNull();
  });

  it("links to the map only when the wonder has a pin", async () => {
    apiMock.getWonder.mockResolvedValue(wonder);
    const { unmount } = renderPage();

    expect(
      await screen.findByRole("link", { name: "View on the map" }),
    ).toHaveAttribute("href", "/wonders?view=map&wonder=obudu-plateau");

    unmount();
    apiMock.getWonder.mockResolvedValue({
      ...wonder,
      latitude: null,
      longitude: null,
    });
    renderPage();

    await screen.findByRole("heading", { name: "Obudu Plateau" });
    expect(screen.queryByRole("link", { name: "View on the map" })).toBeNull();
  });

  it("says so when the wonder does not exist", async () => {
    apiMock.getWonder.mockRejectedValue(new ApiError(404, "Not found"));
    renderPage("nowhere");

    expect(
      await screen.findByText(/We couldn't find that wonder/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See all hidden wonders" }),
    ).toHaveAttribute("href", "/wonders");
  });
});