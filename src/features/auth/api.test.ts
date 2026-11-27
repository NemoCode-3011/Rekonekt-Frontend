import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("../../services/api/client", () => ({ http: httpMock }));

import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  resendOtp,
  resetPassword,
  signIn,
  signUp,
  verifyOtp,
} from "./api";

describe("session auth API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends signup fields and returns the structured signup response", async () => {
    const response = {
      code: "OTP_SENT",
      message: "sent",
      data: {
        expiresInSeconds: 300,
        resendAfterSeconds: 45,
        nextStep: "verify",
      },
    };
    httpMock.post.mockResolvedValue({ data: response });

    await expect(
      signUp({
        name: "Visitor",
        email: "  VISITOR@example.com ",
        password: "passphrase",
        preferredLanguage: "yo",
      }),
    ).resolves.toEqual(response);
    expect(httpMock.post).toHaveBeenCalledWith("/auth/signup", {
      name: "Visitor",
      email: "visitor@example.com",
      password: "passphrase",
      preferredLanguage: "yo",
    });
  });

  it("uses the current session routes and request shapes", async () => {
    const envelope = { code: "OK", message: "ok", data: null };
    httpMock.post.mockResolvedValue({ data: envelope });
    httpMock.get.mockResolvedValue({ data: { ...envelope, data: { id: 8 } } });

    await signIn("USER@example.com", "password");
    await verifyOtp("USER@example.com", "123456");
    await resendOtp("USER@example.com");
    await forgotPassword("USER@example.com");
    await resetPassword("USER@example.com", "654321", "new-password");
    await changePassword("old-password", "new-password");
    await getCurrentUser();

    expect(httpMock.post).toHaveBeenNthCalledWith(1, "/auth/signin", {
      email: "user@example.com",
      password: "password",
      portal: "visitor",
    });
    expect(httpMock.post).toHaveBeenNthCalledWith(2, "/auth/verify-otp", {
      email: "user@example.com",
      otp: "123456",
    });
    expect(httpMock.post).toHaveBeenNthCalledWith(3, "/auth/resend-otp", {
      email: "user@example.com",
    });
    expect(httpMock.post).toHaveBeenNthCalledWith(4, "/auth/forgot-password", {
      email: "user@example.com",
    });
    expect(httpMock.post).toHaveBeenNthCalledWith(5, "/auth/reset-password", {
      email: "user@example.com",
      otp: "654321",
      newPassword: "new-password",
    });
    expect(httpMock.post).toHaveBeenNthCalledWith(6, "/auth/change-password", {
      currentPassword: "old-password",
      newPassword: "new-password",
    });
    expect(httpMock.get).toHaveBeenCalledWith("/auth/me", {
      timeout: 15_000,
    });
  });
});
