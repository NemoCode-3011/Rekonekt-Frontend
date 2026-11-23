import { describe, expect, it, vi } from "vitest";
import { getApiErrorMessage, http, normalizeApiError } from "./client";

describe("API error normalization", () => {
  it("preserves backend validation messages and field errors", () => {
    const error = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
          data: {
            errors: {
              email: ["Enter a valid email address."],
              password: "Password should be at least 8 characters.",
            },
          },
        },
        headers: {},
      },
    });

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Please correct the highlighted fields.");
    expect(error.fieldErrors).toEqual({
      email: "Enter a valid email address.",
      password: "Password should be at least 8 characters.",
    });
  });

  it("reads nested backend errors and keeps rate-limit retry details", () => {
    const error = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 429,
        data: {
          error: { code: "RATE_LIMITED", message: "Wait before trying again." },
          retryAfterSeconds: 30,
        },
        headers: {},
      },
    });

    expect(error.code).toBe("RATE_LIMITED");
    expect(error.message).toBe("Wait before trying again.");
    expect(error.retryAfterSeconds).toBe(30);
  });

  it("does not expose server or network internals", () => {
    const serverError = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: "database password rejected" },
        headers: {},
      },
    });
    const networkError = normalizeApiError({ isAxiosError: true });

    expect(serverError.message).not.toContain("database password");
    expect(getApiErrorMessage(serverError, "fallback")).toBe(
      "We’re having trouble connecting. Try again shortly.",
    );
    expect(getApiErrorMessage(networkError, "fallback")).toContain(
      "Check your connection",
    );
  });
});

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
