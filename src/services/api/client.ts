import axios from "axios";

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfterSeconds?: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.fieldErrors = fieldErrors;
  }
}

const NETWORK_ERROR_MESSAGE =
  "We can’t reach the server. Check your connection and try again.";
const SERVER_ERROR_MESSAGE =
  "We’re having trouble connecting. Try again shortly.";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 0) return NETWORK_ERROR_MESSAGE;
  if (error.status >= 500) return SERVER_ERROR_MESSAGE;
  return error.message || fallback;
}

export function getApiFieldErrors(error: unknown) {
  return error instanceof ApiError ? error.fieldErrors : {};
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
  (error) => Promise.reject(normalizeApiError(error)),
);

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error) || !error.response) {
    return new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const { status, data } = error.response;
  const body = asRecord(data);
  const nestedData = asRecord(body?.data);
  const nestedError = asRecord(body?.error);
  const nestedDataError = asRecord(nestedData?.error);
  const sources = [body, nestedData, nestedError, nestedDataError];
  const code = firstString(sources.map((source) => source?.code));
  const serverMessage = firstString(
    sources.map((source) => source?.message),
  );
  const retryHeader =
    error.response.headers?.["retry-after"] ??
    error.response.headers?.["ratelimit-reset"] ??
    error.response.headers?.["x-ratelimit-reset"];
  const retryFromHeader = parseRetryAfter(retryHeader);
  const retryAfterSeconds = firstNumber([
    nestedData?.retryAfterSeconds,
    body?.retryAfterSeconds,
    retryFromHeader,
  ]);
  const fallbackMessage =
    status === 401
      ? "Please sign in again."
      : status === 403
        ? "You don’t have permission to do that."
        : status === 404
          ? "The requested item could not be found."
          : status === 422
            ? "Please check the information and try again."
            : status === 429
              ? "Too many requests. Please wait before trying again."
              : "Something went wrong. Please try again.";
  const message =
    status >= 500
      ? SERVER_ERROR_MESSAGE
      : serverMessage ?? fallbackMessage;
  const fieldErrors = extractFieldErrors([
    body?.fieldErrors,
    body?.errors,
    body?.details,
    nestedData?.fieldErrors,
    nestedData?.errors,
    nestedData?.details,
  ]);

  if (status === 401 && !EXPECTED_401.includes(error.config?.url ?? "")) {
    onSessionExpired?.();
  }

  return new ApiError(status, message, code, retryAfterSeconds, fieldErrors);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function firstString(values: unknown[]): string | undefined {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function firstNumber(values: unknown[]): number | undefined {
  return values.find(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );
}

function extractFieldErrors(candidates: unknown[]) {
  const result: Record<string, string> = {};

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const detail = asRecord(item);
        const field = firstString([
          detail?.field,
          detail?.path,
          detail?.param,
          detail?.name,
        ]);
        const message = firstString([detail?.message, detail?.msg]);
        if (field && message) result[field] = message;
      }
      continue;
    }

    const errors = asRecord(candidate);
    if (!errors) continue;

    for (const [field, value] of Object.entries(errors)) {
      if (typeof value === "string") {
        result[field] = value;
      } else if (Array.isArray(value)) {
        const message = firstString(value);
        if (message) result[field] = message;
      } else {
        const detail = asRecord(value);
        const message = firstString([detail?.message, detail?.msg]);
        if (message) result[field] = message;
      }
    }
  }

  return result;
}

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
