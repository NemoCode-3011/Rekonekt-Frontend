// @vitest-environment jsdom

import { useEffect, useState, type ReactNode } from "react";
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
import { ApiError } from "../../services/api/client";
import { AuthContext, type AuthContextValue } from "./auth-context";

const authApi = vi.hoisted(() => ({
  signUp: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  signIn: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  googleSignIn: vi.fn(),
}));

vi.mock("./api", () => authApi);
vi.mock("../../features/auth/api", () => authApi);
vi.mock("./components/GoogleAuthButton", () => ({ default: () => null }));
vi.mock("../../features/auth/components/GoogleAuthButton", () => ({
  default: () => null,
}));

import { AuthProvider } from "./AuthProvider";
import SignIn from "../../pages/Auth/SignIn";
import SignUp from "../../pages/Auth/SignUp";
import Verify from "../../pages/Auth/Verify";
import ForgotPassword from "../../pages/Auth/ForgotPassword";
import { useAuth } from "./auth-context";
import { registerUserDataCache } from "./userDataCache";
import type { User } from "./types";

const userA: User = {
  id: 1,
  name: "User A",
  email: "a@example.com",
  role: "visitor",
  preferred_language: "en",
  is_verified: true,
};

const userB: User = {
  ...userA,
  id: 2,
  name: "User B",
  email: "b@example.com",
};

function makeAuthContext(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  return {
    user: null,
    loading: false,
    authUnavailable: false,
    setUser: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(userB),
    clearLocalSession: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    sessionExpired: false,
    recheckSession: vi.fn().mockResolvedValue(true),
    leaveExpiredSession: vi.fn(),
    showToast: vi.fn(),
    ...overrides,
  };
}

function renderAuthRoute(
  route: string,
  element: ReactNode,
  state?: unknown,
  auth = makeAuthContext(),
) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/verify" element={<Verify />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/login" element={element} />
          <Route path="/" element={<p>Home destination</p>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

function fillSignupForm() {
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "New Visitor" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "new@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secure-password" },
  });
}

describe("session authentication flows", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the same sign-in error for invalid credentials", async () => {
    authApi.signIn.mockRejectedValue(
      new ApiError(401, "ignored backend message", "INVALID_CREDENTIALS"),
    );
    renderAuthRoute("/auth/login", <SignIn />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/ }));

    expect(
      await screen.findByText("Email or password is incorrect. Try again."),
    ).toBeInTheDocument();
  });

  it("keeps duplicate signup on the existing-account sign-in path", async () => {
    authApi.signUp.mockRejectedValue(
      new ApiError(409, "ignored backend message", "EMAIL_ALREADY_EXISTS"),
    );
    renderAuthRoute("/auth/signup", <p>Sign in destination</p>);
    fillSignupForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(
        "An account with this email already exists. Sign in to continue.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/auth/login",
    );
    expect(screen.queryByText("Check your email.")).not.toBeInTheDocument();
  });

  it("shows backend signup validation beside its field and preserves entered values", async () => {
    authApi.signUp.mockRejectedValue(
      new ApiError(
        422,
        "Please correct the highlighted fields.",
        "VALIDATION_ERROR",
        undefined,
        { password: "Password should be at least 8 characters." },
      ),
    );
    renderAuthRoute("/auth/signup", <p>Sign in destination</p>);
    fillSignupForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Use at least 8 characters."),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please correct the highlighted fields.",
    );
    expect(screen.getByLabelText("Full name")).toHaveValue("New Visitor");
    expect(screen.getByLabelText("Email")).toHaveValue("new@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("secure-password");
  });

  it("checks the signup password length before sending the request", () => {
    renderAuthRoute("/auth/signup", <p>Sign in destination</p>);
    fillSignupForm();
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Password should be at least 8 characters.")).toBeInTheDocument();
    expect(authApi.signUp).not.toHaveBeenCalled();
  });

  it("offers continue verification when signup created the account but hit OTP cooldown", async () => {
    authApi.signUp.mockRejectedValue(
      new ApiError(429, "ignored backend message", "OTP_COOLDOWN", 42),
    );
    renderAuthRoute("/auth/signup", <p>Sign in destination</p>);
    fillSignupForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Check your email for a verification code."),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to verification" }),
    );
    expect(
      screen.getByText("Check your email for a verification code."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend code in 42s" }),
    ).toBeDisabled();
    expect(authApi.resendOtp).not.toHaveBeenCalled();
  });

  it("offers an explicit verification resend without sending automatically", async () => {
    authApi.signUp.mockRejectedValue(
      new ApiError(409, "ignored backend message", "EMAIL_REQUIRES_VERIFICATION"),
    );
    authApi.resendOtp.mockResolvedValue({
      code: "OTP_REQUEST_ACCEPTED",
      message: "generic",
      data: null,
    });

    renderAuthRoute("/auth/signup", <p>Sign in destination</p>);
    fillSignupForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Continue to verification" }),
    );

    expect(authApi.resendOtp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Resend code" }));
    expect(
      await screen.findByText(/If verification is needed/),
    ).toBeInTheDocument();
    expect(authApi.resendOtp).toHaveBeenCalledTimes(1);
  });

  it("uses the backend OTP cooldown without automatically retrying", async () => {
    authApi.resendOtp.mockRejectedValue(
      new ApiError(429, "ignored backend message", "OTP_COOLDOWN", 37),
    );
    renderAuthRoute(
      "/auth/verify",
      <p>Sign in destination</p>,
      { email: "existing@example.com", resume: true },
    );
    fireEvent.click(screen.getByRole("button", { name: "Resend code" }));

    expect(
      await screen.findByRole("button", { name: "Resend code in 37s" }),
    ).toBeDisabled();
    expect(authApi.resendOtp).toHaveBeenCalledTimes(1);
  });

  it("uses the same neutral confirmation for password recovery", async () => {
    authApi.forgotPassword.mockResolvedValue({
      code: "PASSWORD_RESET_REQUEST_ACCEPTED",
      message: "generic",
      data: null,
    });
    renderAuthRoute("/auth/forgot-password", <p>Sign in destination</p>);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));

    expect(
      await screen.findByText(
        "If there’s an account for this email, a reset code is on the way.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/unknown@example\.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/We sent a/)).not.toBeInTheDocument();
  });

  it("verifies email without logging in and waits for deliberate sign-in", async () => {
    const auth = makeAuthContext();
    authApi.verifyOtp.mockResolvedValue({
      code: "EMAIL_VERIFIED",
      message: "verified",
      data: null,
    });
    renderAuthRoute(
      "/auth/verify",
      <p>Sign in destination</p>,
      {
        email: "new@example.com",
        name: "New Visitor",
        resendAfterSeconds: 37,
      },
      auth,
    );
    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    expect(screen.getByRole("button", { name: "Verify email" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Resend code in 37s" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));

    expect(
      await screen.findByRole("heading", {
        name: "Welcome to REKÒ, New.",
      }),
    ).toBeInTheDocument();
    expect(auth.setUser).not.toHaveBeenCalled();
    expect(auth.refreshUser).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Sign in to continue" }),
    ).toBeInTheDocument();
  });

  it("reloads /auth/me for login and clears scoped data on account change and logout", async () => {
    authApi.getCurrentUser
      .mockResolvedValueOnce(userA)
      .mockResolvedValueOnce(userB);
    authApi.logout.mockResolvedValue({ code: "LOGOUT_SUCCESS", data: null });

    function CacheProbe() {
      const { user, refreshUser, logout } = useAuth();
      const [cached, setCached] = useState("empty");
      useEffect(
        () =>
          registerUserDataCache(() => {
            setCached("cleared");
          }),
        [],
      );
      return (
        <>
          <p>Current: {user?.name ?? "signed out"}</p>
          <p>Scoped cache: {cached}</p>
          <button type="button" onClick={() => setCached("account data")}>
            Add scoped data
          </button>
          <button type="button" onClick={() => void refreshUser()}>
            Switch account
          </button>
          <button type="button" onClick={() => void logout()}>
            Log out
          </button>
        </>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <CacheProbe />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Current: User A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add scoped data" }));
    expect(screen.getByText("Scoped cache: account data")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch account" }));
    expect(await screen.findByText("Current: User B")).toBeInTheDocument();
    expect(screen.getByText("Scoped cache: cleared")).toBeInTheDocument();
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByText("Current: signed out")).toBeInTheDocument();
    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Scoped cache: cleared")).toBeInTheDocument();
  });

  it("treats a 401 as signed out and other /me failures as retryable", async () => {
    function AuthStatus() {
      const { user, loading, authUnavailable } = useAuth();
      if (loading) return <p>checking session</p>;
      return (
        <p>
          {authUnavailable ? "session unavailable" : user ? "signed in" : "signed out"}
        </p>
      );
    }

    authApi.getCurrentUser.mockRejectedValueOnce(
      new ApiError(401, "unauthorized", "UNAUTHENTICATED"),
    );
    const first = render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStatus />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();

    first.unmount();
    authApi.getCurrentUser.mockRejectedValueOnce(
      new ApiError(503, "temporary", "RATE_LIMIT_STORE_UNAVAILABLE"),
    );
    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStatus />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("session unavailable")).toBeInTheDocument();
  });

  it("uses /auth/me rather than the signin response user", async () => {
    const auth = makeAuthContext();
    auth.refreshUser = vi.fn().mockResolvedValue(userB);
    authApi.signIn.mockResolvedValue({
      code: "LOGIN_SUCCESS",
      message: "ok",
      data: userA,
    });
    renderAuthRoute("/auth/login", <SignIn />, null, auth);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "b@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/ }));

    await waitFor(() => expect(auth.refreshUser).toHaveBeenCalledTimes(1));
    expect(auth.setUser).not.toHaveBeenCalled();
  });
});
