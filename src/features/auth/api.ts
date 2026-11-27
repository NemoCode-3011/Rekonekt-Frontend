import { ApiError, http } from "../../services/api/client";
import type { User } from "./types";

export interface CulturalGroup {
  id: number;
  name: string;
  language: string | null;
  region: string | null;
}

export interface AuthResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

export interface SignupData {
  expiresInSeconds: number;
  resendAfterSeconds: number;
  nextStep: string;
}

const cleanEmail = (email: string) => email.trim().toLowerCase();

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  preferredLanguage?: string;
}) {
  const res = await http.post<AuthResponse<SignupData>>("/auth/signup", {
    ...input,
    email: cleanEmail(input.email),
  });
  return res.data;
}

export async function verifyOtp(email: string, otp: string) {
  const res = await http.post<AuthResponse<null>>("/auth/verify-otp", {
    email: cleanEmail(email),
    otp,
  });
  return res.data;
}

export async function resendOtp(email: string) {
  const res = await http.post<AuthResponse<null>>("/auth/resend-otp", {
    email: cleanEmail(email),
  });
  return res.data;
}

export async function signIn( email: string,password: string,portal: "visitor" | "admin" = "visitor",) {
  const res = await http.post<AuthResponse<User>>("/auth/signin", {
    email: cleanEmail(email),
    password,
    portal,
  });
  return res.data;
}
export async function forgotPassword(email: string) {
  const res = await http.post<AuthResponse<null>>("/auth/forgot-password", {
    email: cleanEmail(email),
  });
  return res.data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  const res = await http.post<AuthResponse<null>>("/auth/reset-password", {
    email: cleanEmail(email),
    otp,
    newPassword,
  });
  return res.data;
}

export async function getCurrentUser() {
  const res = await http.get<AuthResponse<User>>("/auth/me", {
    timeout: 15_000,
  });
  if (!res.data.data) {
    throw new ApiError(
      502,
      "We couldn't confirm the signed-in account. Please try again.",
      "INVALID_AUTH_RESPONSE",
    );
  }
  return res.data.data;
}

export async function logout() {
  const res = await http.post<AuthResponse<null>>("/auth/logout");
  return res.data;
}

// ---------- Settings ----------

export async function updateProfile(input: {
  name: string;
  preferredLanguage: string;
  culturalGroupId: number | null;
}) {
  const res = await http.patch<{ message: string; data: User }>(
    "/auth/me",
    input,
  );
  return res.data.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const res = await http.post<AuthResponse<null>>("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
}

export async function getCulturalGroups() {
  const res = await http.get<{ message: string; data: CulturalGroup[] }>(
    "/cultural-groups",
  );
  return res.data.data;
}

export async function googleSignIn(
  credential: string,
  mode: "signin" | "signup",
) {
  const res = await http.post<{ message: string; data: User }>("/auth/google", {
    credential,
    mode,
  });
  return res.data.data;
}
