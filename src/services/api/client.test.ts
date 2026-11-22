import { describe, expect, it, vi } from "vitest";
import { http } from "./client";

describe("browser API client session configuration", () => {
  it("sends browser cookies without adding an authorization token", () => {
    expect(http.defaults.withCredentials).toBe(true);
    expect(http.defaults.headers.common.Authorization).toBeUndefined();
    expect(http.defaults.headers.common.Origin).toBeUndefined();
  });

  it("resolves API paths against VITE_API_URL", async () => {
    const backendOrigin = "https://backend.example.test";
    vi.stubEnv("VITE_API_URL", backendOrigin);
    vi.resetModules();

    try {
      const { http: configuredHttp } = await import("./client");

      expect(configuredHttp.defaults.baseURL).toBe(backendOrigin);
      expect(configuredHttp.getUri({ url: "/auth/me" })).toBe(
        `${backendOrigin}/auth/me`,
      );
      expect(configuredHttp.getUri({ url: "/exhibitions" })).toBe(
        `${backendOrigin}/exhibitions`,
      );
      expect(configuredHttp.defaults.withCredentials).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
