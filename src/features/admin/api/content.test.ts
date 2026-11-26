import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../../services/api/client", () => ({ http: httpMock }));

import {
  createAdminEvent,
  createAdminPerson,
  createAdminPlace,
  updateAdminPlace,
  linkEventPerson,
  setEventSection,
} from "./content";

describe("admin content API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an event without a section relationship", async () => {
    httpMock.post.mockResolvedValue({ data: { data: { id: 21 } } });

    await createAdminEvent({
      title: "A standalone event",
      description: "",
      eventDate: "",
      dateDisplay: "",
      imageUrl: "",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/events", {
      title: "A standalone event",
      slug: "a-standalone-event",
    });
  });

  it("sends null when disconnecting an event from its chapter", async () => {
    httpMock.patch.mockResolvedValue({});

    await setEventSection(21, null);

    expect(httpMock.patch).toHaveBeenCalledWith("/events/21", {
      sectionId: null,
    });
  });

  it("generates a person slug and sends person fields in camelCase", async () => {
    httpMock.post.mockResolvedValue({ data: { data: { id: 8 } } });

    await createAdminPerson({
      name: "Ada Example",
      description: "",
      birthDate: "1900-01-02",
      deathDate: "",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/people", {
      name: "Ada Example",
      slug: "ada-example",
      birthDate: "1900-01-02",
    });
  });

  it("attaches an uploaded picture to a newly created person", async () => {
    httpMock.post.mockImplementation((path: string) =>
      Promise.resolve({
        data: {
          data:
            path === "/people"
              ? { id: 8, name: "Ada Example" }
              : { id: 91 },
        },
      }),
    );

    await createAdminPerson({
      name: "Ada Example",
      imageUrl: "https://cdn.example/ada.jpg",
      imageMediaId: "91",
      imageCredit: "Archive",
      imageLicense: "CC BY",
    });

    expect(httpMock.post).toHaveBeenNthCalledWith(
      2,
      "/media-attachment",
      { mediaId: 91, personId: 8, displayOrder: 0 },
    );
  });

  it("converts place coordinates to numeric API fields", async () => {
    httpMock.post.mockResolvedValue({ data: { data: { id: 9 } } });

    await createAdminPlace({
      name: "Example Place",
      description: "",
      coordinates: "6.3350, 5.6037",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/places", {
      name: "Example Place",
      latitude: 6.335,
      longitude: 5.6037,
    });
  });

  it("uses a supplied place slug without sending blank optional fields", async () => {
    httpMock.post.mockResolvedValue({ data: { data: { id: 10 } } });

    await createAdminPlace({
      name: "Example Place",
      slug: "example-place-custom",
      coordinates: "6.3350, 5.6037",
      region: "",
      category: "",
      summary: "",
      description: "",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/places", {
      name: "Example Place",
      slug: "example-place-custom",
      latitude: 6.335,
      longitude: 5.6037,
    });
  });

  it("attaches a newly uploaded place picture", async () => {
    httpMock.post.mockImplementation((path: string) =>
      Promise.resolve({
        data: {
          data: path === "/places" ? { id: 11 } : { id: 91 },
        },
      }),
    );

    await createAdminPlace({
      name: "Example Place",
      coordinates: "6.3350, 5.6037",
      imageUrl: "https://cdn.example/place.jpg",
      imageMediaId: "91",
      imageCredit: "Archive",
      imageLicense: "CC BY",
    });

    expect(httpMock.post).toHaveBeenNthCalledWith(
      2,
      "/media-attachment",
      { mediaId: 91, placeId: 11, displayOrder: 0 },
    );
  });

  it("omits a blank slug and sends nulls to clear optional place fields", async () => {
    httpMock.patch.mockResolvedValue({});

    await updateAdminPlace(11, {
      name: "Example Place",
      slug: "",
      coordinates: "6.3350, 5.6037",
      summary: "",
      region: "",
      category: "",
      description: "",
      coverImageUrl: "",
      coverImageAlt: "",
      coverImageCredit: "",
    });

    expect(httpMock.patch).toHaveBeenCalledWith("/places/11", {
      name: "Example Place",
      summary: null,
      region: null,
      category: null,
      description: null,
      latitude: 6.335,
      longitude: 5.6037,
      coverImageUrl: null,
      coverImageAlt: null,
      coverImageCredit: null,
    });
  });

  it("attaches a newly uploaded picture when updating a place", async () => {
    httpMock.patch.mockResolvedValue({});
    httpMock.post.mockResolvedValue({ data: { data: { id: 92 } } });

    await updateAdminPlace(11, {
      name: "Example Place",
      coordinates: "6.3350, 5.6037",
      coverImageUrl: "https://cdn.example/new-place.jpg",
      imageMediaId: "92",
      coverImageCredit: "Archive",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/media-attachment", {
      mediaId: 92,
      placeId: 11,
      displayOrder: 0,
    });
  });

  it("uses camelCase relationship request fields", async () => {
    httpMock.post.mockResolvedValue({ data: { data: {} } });

    await linkEventPerson(21, 8);

    expect(httpMock.post).toHaveBeenCalledWith("/events/21/people", {
      personId: 8,
    });
  });

  it("validates place coordinates before sending the create request", async () => {
    expect(() =>
      createAdminPlace({ name: "Somewhere", coordinates: "91, 20" }),
    ).toThrow("Enter valid latitude and longitude coordinates.");
    expect(httpMock.post).not.toHaveBeenCalled();
  });
});
