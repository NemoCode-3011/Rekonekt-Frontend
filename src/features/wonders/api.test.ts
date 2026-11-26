import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../../services/api/client", () => ({ http: httpMock }));

import { getWonder, getWonders } from "./api";

describe("wonders api", () => {
  beforeEach(() => {
    httpMock.get.mockReset();
  });

  it("loads every published wonder", async () => {
    httpMock.get.mockResolvedValue({
      data: { message: "ok", data: [{ id: 1, slug: "obudu-plateau" }] },
    });

    await expect(getWonders()).resolves.toEqual([
      { id: 1, slug: "obudu-plateau" },
    ]);
    expect(httpMock.get).toHaveBeenCalledWith("/wonders", {
      params: undefined,
    });
  });

  it("loads one wonder by its slug", async () => {
    httpMock.get.mockResolvedValue({
      data: { message: "ok", data: { id: 2, slug: "osun-osogbo" } },
    });

    await expect(getWonder("osun-osogbo")).resolves.toEqual({
      id: 2,
      slug: "osun-osogbo",
    });
    expect(httpMock.get).toHaveBeenCalledWith("/wonders/osun-osogbo", {
      params: undefined,
    });
  });

  it("makes the slug safe to put in an address", async () => {
    httpMock.get.mockResolvedValue({ data: { message: "ok", data: {} } });

    await getWonder("a/b?c");

    expect(httpMock.get).toHaveBeenCalledWith("/wonders/a%2Fb%3Fc", {
      params: undefined,
    });
  });
});