import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../../services/api/client", () => ({
  http: httpMock,
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { ApiError } from "../../../services/api/client";
import {
  createAdminWonder,
  parseLinks,
  parseLocation,
  updateAdminWonder,
} from "./wonders";

describe("parseLocation", () => {
  it("treats an empty box as no pin", () => {
    expect(parseLocation("")).toBeNull();
    expect(parseLocation("   ")).toBeNull();
  });

  it("reads plain coordinates", () => {
    expect(parseLocation("6.3350, 5.6037")).toEqual({
      latitude: 6.335,
      longitude: 5.6037,
    });
  });

  it("reads a Google Maps link with @latitude,longitude", () => {
    expect(
      parseLocation("https://www.google.com/maps/place/Obudu/@6.3706,9.3813,15z/data=x"),
    ).toEqual({ latitude: 6.3706, longitude: 9.3813 });
  });

  it("reads a Google Maps link with !3d and !4d", () => {
    expect(
      parseLocation("https://www.google.com/maps/place/X/data=!3d7.7827!4d4.5418"),
    ).toEqual({ latitude: 7.7827, longitude: 4.5418 });
  });

  it("reads a link with ?q=latitude,longitude", () => {
    expect(parseLocation("https://maps.google.com/?q=9.0765,7.3986")).toEqual({
      latitude: 9.0765,
      longitude: 7.3986,
    });
  });

  it("explains what to do when it can't read the text", () => {
    expect(() => parseLocation("near the big tree")).toThrow(/coordinates/i);
    expect(() => parseLocation("95, 20")).toThrow(/coordinates/i);
  });
});

describe("parseLinks", () => {
  it("skips blank rows", () => {
    expect(
      parseLinks(JSON.stringify([{ label: "", url: "", note: "" }])),
    ).toEqual([]);
    expect(parseLinks("")).toEqual([]);
    expect(parseLinks("not json")).toEqual([]);
  });

  it("keeps the order and leaves out an empty note", () => {
    expect(
      parseLinks(
        JSON.stringify([
          { label: "Official site", url: "https://example.com", note: "Plan a visit" },
          { label: "Tourism board", url: "https://example.org", note: "" },
        ]),
      ),
    ).toEqual([
      { label: "Official site", url: "https://example.com", note: "Plan a visit" },
      { label: "Tourism board", url: "https://example.org" },
    ]);
  });

  it("adds https:// when only a domain was typed", () => {
    expect(
      parseLinks(JSON.stringify([{ label: "Ranch", url: "obuduranch.com", note: "" }])),
    ).toEqual([{ label: "Ranch", url: "https://obuduranch.com" }]);
  });

  it("asks for both a name and an address", () => {
    expect(() =>
      parseLinks(JSON.stringify([{ label: "Ranch", url: "", note: "" }])),
    ).toThrow(/both a name and a web address/i);
  });

  it("rejects text that is not an address", () => {
    expect(() =>
      parseLinks(JSON.stringify([{ label: "Bad", url: "javascript:alert(1)", note: "" }])),
    ).toThrow(/web address/i);
  });
});

describe("saving a wonder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a wonder, leaving out empty fields", async () => {
    httpMock.post.mockResolvedValue({ data: { data: { id: 5 } } });

    await createAdminWonder({
      title: "Osun-Osogbo Festival",
      wonderType: "festival",
      summary: "",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/wonders", {
      slug: "osun-osogbo-festival",
      title: "Osun-Osogbo Festival",
      wonderType: "festival",
      references: [],
    });
  });

  it("tries another slug when the first is taken", async () => {
    httpMock.post
      .mockRejectedValueOnce(new ApiError(409, "Wonder slug already exists"))
      .mockResolvedValueOnce({ data: { data: { id: 6 } } });

    await createAdminWonder({ title: "Obudu", wonderType: "place" });

    expect(httpMock.post.mock.calls[0][1].slug).toBe("obudu");
    expect(httpMock.post.mock.calls[1][1].slug).toBe("obudu-2");
  });

  it("sends the map pin and the links when updating", async () => {
    httpMock.patch.mockResolvedValue({});

    await updateAdminWonder(3, {
      title: "Obudu Plateau",
      wonderType: "place",
      summary: "A cool highland.",
      content: "<p>Cool air.</p>",
      region: "Cross River",
      location: "6.37, 9.37",
      coverImageUrl: "https://cdn.example.com/obudu.jpg",
      imageCredit: "Jane Doe",
      videoUrl: "https://youtu.be/abc",
      references: JSON.stringify([
        { label: "Official website", url: "https://example.com", note: "" },
      ]),
    });

    expect(httpMock.patch).toHaveBeenCalledWith("/wonders/3", {
      title: "Obudu Plateau",
      wonderType: "place",
      summary: "A cool highland.",
      content: "<p>Cool air.</p>",
      region: "Cross River",
      latitude: 6.37,
      longitude: 9.37,
      coverImageUrl: "https://cdn.example.com/obudu.jpg",
      coverImageAlt: null,
      coverImageCredit: "Jane Doe",
      videoUrl: "https://youtu.be/abc",
      references: [{ label: "Official website", url: "https://example.com" }],
    });
  });

  it("clears emptied fields by sending null when updating", async () => {
    httpMock.patch.mockResolvedValue({});

    await updateAdminWonder(3, {
      title: "Obudu Plateau",
      wonderType: "place",
      summary: "",
      location: "",
      references: "[]",
    });

    const sent = httpMock.patch.mock.calls[0][1];
    expect(sent.summary).toBeNull();
    expect(sent.latitude).toBeNull();
    expect(sent.longitude).toBeNull();
    expect(sent.references).toEqual([]);
  });
});