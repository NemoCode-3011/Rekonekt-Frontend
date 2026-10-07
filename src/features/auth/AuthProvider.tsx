import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutRequest } from "./api";
import type { User } from "./types";
import { AuthContext, type Toast } from "./auth-context";
import { setSessionExpiredHandler } from "../../services/api/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  // The session-expired handler runs outside React's rendering, so it reads
  // the latest user and page from refs.
  const userRef = useRef<User | null>(null);
  const pathRef = useRef("/");

  useEffect(() => {
    userRef.current = user;
    pathRef.current = location.pathname + location.search;
  });

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

  // If a signed-in visitor's session ends, send them to sign in again.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (!userRef.current) return; // guests have no session to lose

      userRef.current = null; // several requests can fail at once: react once
      setUser(null);

      const path = pathRef.current;

      if (path.startsWith("/admin")) {
        navigate("/admin/login", { replace: true, state: { expired: true } });
      } else {
        navigate("/auth/login", {
          replace: true,
          state: { expired: true, from: path },
        });
      }
    });

    return () => setSessionExpiredHandler(null);
  }, [navigate]);

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
