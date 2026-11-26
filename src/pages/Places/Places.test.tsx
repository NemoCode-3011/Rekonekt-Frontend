// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PlaceBundle, PlaceCard } from "../../features/places/types";

const apiMock = vi.hoisted(() => ({
  listPlaces: vi.fn(),
  getPlaceFacets: vi.fn(),
  getPlaceBundles: vi.fn(),
}));

vi.mock("../../features/places/api", () => apiMock);
vi.mock("../../features/map/LazyMap", () => ({ default: () => null }));

import Places from "./Places";

function card(id: number, name: string, slug: string): PlaceCard {
  return {
    id,
    name,
    slug,
    summary: null,
    region: null,
    category: null,
    latitude: "6.5",
    longitude: "3.4",
    cover_image_url: null,
    cover_image_alt: null,
    cover_image_credit: null,
  };
}

const oldMarket = card(1, "Old Market", "old-market");
const palace = card(2, "Palace", "palace");
const loneRock = card(3, "Lone Rock", "lone-rock");
const singleShrine = card(4, "Single Shrine", "single-shrine");
const places = [oldMarket, palace, loneRock, singleShrine];

function member(place: PlaceCard) {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    region: null,
    category: null,
    cover_image_url: null,
    cover_image_alt: null,
  };
}

const bundles: PlaceBundle[] = [
  {
    id: 10,
    title: "Aburi Accord",
    slug: "aburi-accord",
    subtitle: "Where the talks took place",
    cover_image_url: null,
    place_count: 2,
    places: [member(oldMarket), member(palace)],
  },
  {
    id: 11,
    title: "Shrine Trail",
    slug: "shrine-trail",
    subtitle: null,
    cover_image_url: null,
    place_count: 1,
    places: [member(singleShrine)],
  },
];

function renderPage(path = "/explore/places") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/explore/places" element={<Places />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("places page", () => {
  beforeEach(() => {
    apiMock.listPlaces.mockReset();
    apiMock.getPlaceFacets.mockReset();
    apiMock.getPlaceBundles.mockReset();

    apiMock.listPlaces.mockImplementation((query?: { q?: string }) =>
      Promise.resolve(query?.q ? [oldMarket] : places),
    );
    apiMock.getPlaceFacets.mockResolvedValue({
      regions: [],
      categories: [],
      total: 4,
      pinned: 4,
    });
    apiMock.getPlaceBundles.mockResolvedValue(bundles);
  });

  afterEach(cleanup);

  it("shows an exhibition as one tile and keeps its places out of the cards", async () => {
    renderPage();

    const tile = await screen.findByRole("link", { name: /Aburi Accord/ });
    expect(tile).toHaveAttribute(
      "href",
      "/explore/places?exhibition=aburi-accord",
    );
    expect(screen.getByText("2 places")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Lone Rock" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Old Market" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Palace" })).toBeNull();
  });

  it("keeps a lone exhibition place as a card with a label", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Single Shrine" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Part of Shrine Trail")).toBeInTheDocument();
  });

  it("opens one exhibition's places", async () => {
    renderPage("/explore/places?exhibition=aburi-accord");

    expect(
      await screen.findByRole("heading", { name: "Aburi Accord", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Old Market" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Palace" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lone Rock" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open the exhibition" }),
    ).toHaveAttribute("href", "/exhibitions/aburi-accord");
    expect(screen.getByRole("link", { name: /All places/ })).toHaveAttribute(
      "href",
      "/explore/places",
    );
  });

  it("says so when the exhibition is not found", async () => {
    renderPage("/explore/places?exhibition=nowhere");

    expect(
      await screen.findByText(/We couldn't find that exhibition/),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lone Rock" })).toBeInTheDocument();
  });

  it("shows the plain list of places if the exhibitions can't be loaded", async () => {
    apiMock.getPlaceBundles.mockRejectedValue(new Error("boom"));
    renderPage();

    for (const name of ["Old Market", "Palace", "Lone Rock", "Single Shrine"]) {
      expect(await screen.findByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: /Aburi Accord/ })).toBeNull();
  });

  it("goes back to the plain list while searching", async () => {
    renderPage();
    await screen.findByRole("link", { name: /Aburi Accord/ });

    fireEvent.change(screen.getByLabelText("Search places"), {
      target: { value: "market" },
    });

    await waitFor(() =>
      expect(apiMock.listPlaces).toHaveBeenLastCalledWith({
        region: undefined,
        category: undefined,
        q: "market",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Old Market" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Aburi Accord/ })).toBeNull();
    expect(apiMock.getPlaceBundles).toHaveBeenCalledTimes(1);
  });
});