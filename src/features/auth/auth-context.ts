import { createContext, useContext } from "react";
import type { User } from "./types";

export type ToastType = "success" | "error";

export type Toast = {
  message: string;
  type: ToastType;
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  sessionExpired: boolean;
  recheckSession: () => Promise<boolean>;
  leaveExpiredSession: () => void;
  showToast: (message: string, type?: ToastType) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
