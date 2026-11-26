// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type {
  ExperienceEvent,
  ExperienceMedia,
} from "../../features/experience/types";

const mocks = vi.hoisted(() => ({
  getEvent: vi.fn(),
  media: [] as unknown[],
}));

vi.mock("../../features/experience/api", () => ({
  getEvent: mocks.getEvent,
}));

vi.mock("../../features/experience/discovery/discovery-context", () => ({
  useDiscovery: () => ({ open: vi.fn(), openRef: vi.fn() }),
}));

vi.mock("../../features/experience/useConnections", () => ({
  useEventMedia: () => ({ items: mocks.media, status: "ready" }),
  useEventPeople: () => ({
    items: [{ id: 1, name: "Ada Example", slug: "ada-example" }],
    status: "ready",
  }),
  useEventPlaces: () => ({
    items: [{ id: 5, name: "Old Market" }],
    status: "ready",
  }),
  useEventSources: () => ({ items: [], status: "ready" }),
}));

import { ApiError } from "../../services/api/client";
import EventPage from "./EventPage";

const event: ExperienceEvent = {
  id: 7,
  section_id: null,
  title: "The Great Market Fire",
  slug: "great-market-fire",
  description:
    '<p>The market burned for two days.</p><script>window.hacked = true</script><iframe src="https://evil.example/x"></iframe><img src="data:image/png;base64,AAAA">',
  event_date: "1925-03-02",
  date_display: "March 1925",
  image_url: null,
};

const youtubeVideo: ExperienceMedia = {
  id: 1,
  title: "Survivors remember",
  media_type: "video",
  file_url: "https://youtu.be/dQw4w9WgXcQ",
  caption: null,
  description: null,
  source_credit: null,
  license: null,
  video_provider: "youtube",
  embed_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
};

function renderPage(id = "7") {
  return render(
    <MemoryRouter initialEntries={[`/events/${id}`]}>
      <Routes>
        <Route path="/events/:id" element={<EventPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("event page", () => {
  beforeEach(() => {
    mocks.getEvent.mockReset();
    mocks.media = [];
  });

  afterEach(cleanup);

  it("shows the event with a safe story", async () => {
    mocks.getEvent.mockResolvedValue(event);
    const { container } = renderPage();

    expect(
      await screen.findByRole("heading", { name: "The Great Market Fire", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("The market burned for two days.")).toBeInTheDocument();
    expect(screen.getAllByText("March 1925").length).toBeGreaterThan(0);
    expect(mocks.getEvent).toHaveBeenCalledWith(7);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("links to the people and places of the event", async () => {
    mocks.getEvent.mockResolvedValue(event);
    renderPage();

    expect(await screen.findByRole("link", { name: "Ada Example" })).toHaveAttribute(
      "href",
      "/people/ada-example",
    );
    expect(screen.getByRole("button", { name: "Old Market" })).toBeInTheDocument();
  });

  it("embeds a YouTube video from its safe address", async () => {
    mocks.media = [youtubeVideo];
    mocks.getEvent.mockResolvedValue(event);
    renderPage();

    const video = await screen.findByTitle("Survivors remember");
    expect(video).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("skips a YouTube video without a safe address", async () => {
    mocks.media = [{ ...youtubeVideo, embed_url: "https://evil.example/embed/x" }];
    mocks.getEvent.mockResolvedValue(event);
    renderPage();

    await screen.findByRole("heading", { name: "The Great Market Fire" });
    expect(screen.queryByTitle("Survivors remember")).toBeNull();
  });

  it("says so when the event does not exist", async () => {
    mocks.getEvent.mockRejectedValue(new ApiError(404, "Not found"));
    renderPage("99");

    expect(await screen.findByText(/We couldn't find that event/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See all events" })).toHaveAttribute(
      "href",
      "/explore/events",
    );
  });

  it("does not ask the server for an address that isn't a number", async () => {
    renderPage("abc");

    expect(await screen.findByText(/We couldn't find that event/)).toBeInTheDocument();
    expect(mocks.getEvent).not.toHaveBeenCalled();
  });
});