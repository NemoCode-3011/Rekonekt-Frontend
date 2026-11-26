import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../../services/api/client", () => ({ http: httpMock }));

import { getPlaceBySlug, getPlaceFacets, listPlaces } from "./api";

describe("public places API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists places with encoded filters", async () => {
    httpMock.get.mockResolvedValue({ data: { data: [] } });

    await listPlaces({
      region: "Federal Capital Territory",
      category: "sacred-site",
      q: "  Osun grove  ",
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      "/places?region=Federal+Capital+Territory&category=sacred-site&q=Osun+grove",
    );
  });

  it("gets the published-place filter counts", async () => {
    httpMock.get.mockResolvedValue({ data: { data: { total: 3, pinned: 2 } } });

    await getPlaceFacets();

    expect(httpMock.get).toHaveBeenCalledWith("/places/facets");
  });

  it("gets a place detail by its URL slug", async () => {
    httpMock.get.mockResolvedValue({ data: { data: { slug: "ile-ife" } } });

    await getPlaceBySlug("ile ife/old town");

    expect(httpMock.get).toHaveBeenCalledWith(
      "/places/slug/ile%20ife%2Fold%20town",
    );
  });
});
