import axios from "axios";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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
      if (
        error.response.status === 401 &&
        !EXPECTED_401.includes(error.config?.url ?? "")
      ) {
        onSessionExpired?.();
      }

      return Promise.reject(
        new ApiError(
          error.response.status,
          error.response.data?.message ??
            "Something went wrong. Please try again.",
        ),
      );
    }
    return Promise.reject(
      new ApiError(
        0,
        "Can't reach the server. Check your connection and try again.",
      ),
    );
  },
);
