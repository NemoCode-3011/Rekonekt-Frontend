import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, logout as logoutRequest } from "./api";
import type { User } from "./types";
import { AuthContext, type Toast } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Ask the backend who is signed in (reads the sessionId cookie)
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        showToast: (message, type = "success") => setToast({ message, type }),
      }}
    >
      {children}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-4 px-5 py-4 text-body-s text-ivory shadow-xl ${
            toast.type === "error" ? "bg-error" : "bg-deep-forest"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="shrink-0 text-lg leading-none text-ivory/80 hover:text-ivory"
          >
            ×
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}