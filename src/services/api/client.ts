import axios from "axios";

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the sessionId cookie
});

// These requests are expected to answer 401 when nobody is signed in,
// so a 401 from them does not mean a session expired.
const EXPECTED_401 = [
  "/auth/me",
  "/auth/signin",
  "/auth/signup",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/logout",
  "/auth/google",
];

// The app registers what should happen when a session expires.
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// Every failed request becomes an ApiError
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      const code: string | undefined =
        data?.code ?? data?.data?.code ?? data?.error?.code;
      const retryHeader =
        error.response.headers?.["retry-after"] ??
        error.response.headers?.["ratelimit-reset"] ??
        error.response.headers?.["x-ratelimit-reset"];
      const retryFromHeader = parseRetryAfter(retryHeader);
      const retryAfterSeconds =
        typeof data?.data?.retryAfterSeconds === "number"
          ? data.data.retryAfterSeconds
          : typeof data?.retryAfterSeconds === "number"
            ? data.retryAfterSeconds
            : retryFromHeader;
      const serverMessage =
        typeof data?.message === "string" ? data.message : undefined;
      const safeMessage =
        status === 429
          ? "Too many requests. Please wait before trying again."
          : status >= 500
            ? "We’re having trouble connecting. Try again shortly."
            : serverMessage ?? "Something went wrong. Please try again.";

      if (status === 401 && !EXPECTED_401.includes(error.config?.url ?? "")) {
        onSessionExpired?.();
      }

      return Promise.reject(
        new ApiError(status, safeMessage, code, retryAfterSeconds),
      );
    }
    return Promise.reject(
      new ApiError(
        0,
        "We’re having trouble connecting. Try again shortly.",
      ),
    );
  },
);

function parseRetryAfter(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    const seconds =
      parsed > 1_000_000_000 ? parsed - Date.now() / 1000 : parsed;
    return Math.max(0, Math.ceil(seconds));
  }
  if (typeof value === "string") {
    const date = Date.parse(value);
    if (Number.isFinite(date)) {
      return Math.max(0, Math.ceil((date - Date.now()) / 1000));
    }
  }
  return undefined;
}
