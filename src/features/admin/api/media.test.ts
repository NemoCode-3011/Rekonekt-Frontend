import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../../services/api/client", () => ({ http: httpMock }));

import {
  attachAdminMediaToEvent,
  createAdminYouTubeMedia,
  getAdminEventMedia,
  removeAdminEventMedia,
  uploadAdminVideo,
} from "./media";

describe("admin event media API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates YouTube media with the backend's camelCase request fields", async () => {
    httpMock.post.mockResolvedValue({
      data: { message: "Created", data: { id: 12 } },
    });

    await createAdminYouTubeMedia({
      title: "Video title",
      youtubeUrl: "https://youtu.be/example",
      sourceCredit: "Archive",
      license: "CC BY",
    });

    expect(httpMock.post).toHaveBeenCalledWith("/media/youtube", {
      title: "Video title",
      youtubeUrl: "https://youtu.be/example",
      sourceCredit: "Archive",
      license: "CC BY",
    });
  });

  it("uploads a video without sending mediaType", async () => {
    httpMock.post.mockResolvedValue({
      data: {
        message: "Uploaded",
        data: { id: 13, file_url: "https://cdn.example/video.mp4" },
      },
    });
    const file = new File(["video"], "video.mp4", { type: "video/mp4" });

    await uploadAdminVideo(
      file,
      { title: "Video title", description: "A short clip" },
      () => undefined,
    );

    const [path, form] = httpMock.post.mock.calls[0];
    expect(path).toBe("/media/upload");
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("file")).toBe(file);
    expect(form.get("title")).toBe("Video title");
    expect(form.get("description")).toBe("A short clip");
    expect(form.has("mediaType")).toBe(false);
  });

  it("uses the admin event media endpoint and attachment ID for removal", async () => {
    httpMock.get.mockResolvedValue({ data: { message: "Read", data: [] } });
    httpMock.delete.mockResolvedValue({});

    await getAdminEventMedia(31);
    await removeAdminEventMedia(45);

    expect(httpMock.get).toHaveBeenCalledWith("/admin/events/31/media");
    expect(httpMock.delete).toHaveBeenCalledWith("/media-attachment/45");
  });

  it("attaches uploaded media to an event using camelCase IDs", async () => {
    httpMock.post.mockResolvedValue({});

    await attachAdminMediaToEvent(12, 31, 2);

    expect(httpMock.post).toHaveBeenCalledWith("/media-attachment", {
      mediaId: 12,
      eventId: 31,
      displayOrder: 2,
    });
  });
});
