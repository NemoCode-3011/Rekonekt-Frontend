import { describe, expect, it } from "vitest";
import { http } from "./client";

describe("browser API client session configuration", () => {
  it("sends browser cookies without adding an authorization token", () => {
    expect(http.defaults.withCredentials).toBe(true);
    expect(http.defaults.headers.common.Authorization).toBeUndefined();
    expect(http.defaults.headers.common.Origin).toBeUndefined();
  });
});
