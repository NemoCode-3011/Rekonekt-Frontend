import { http } from "./client";
import type { User } from "../../types/auth";

const cleanEmail = (email: string) => email.trim().toLowerCase();

export function signUp(input: {
  name: string;
  email: string;
  password: string;
}) {
  return http.post("/auth/signup", {
    ...input,
    email: cleanEmail(input.email),
  });
}

export function verifyOtp(email: string, otp: string) {
  return http.post("/auth/verify-otp", { email: cleanEmail(email), otp });
}

export function resendOtp(email: string) {
  return http.post("/auth/resend-otp", { email: cleanEmail(email) });
}

export async function signIn(email: string, password: string) {
  const res = await http.post<{ message: string; data: User }>("/auth/signin", {
    email: cleanEmail(email),
    password,
  });
  return res.data.data;
}

export function forgotPassword(email: string) {
  return http.post("/auth/forgot-password", { email: cleanEmail(email) });
}

export function resetPassword(email: string, otp: string, newPassword: string) {
  return http.post("/auth/reset-password", {
    email: cleanEmail(email),
    otp,
    newPassword,
  });
}

export async function getCurrentUser() {
  const res = await http.get<{ message: string; data: User }>("/auth/me");
  return res.data.data;
}

export function logout() {
  return http.post("/auth/logout");
}
