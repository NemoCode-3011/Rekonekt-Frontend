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
  const [sessionExpired, setSessionExpired] = useState(false);
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

      // In the admin, keep the page open so nothing typed is lost.
      if (pathRef.current.startsWith("/admin")) {
        setSessionExpired(true);
        return;
      }

      userRef.current = null; // several requests can fail at once: react once
      setUser(null);
      navigate("/auth/login", {
        replace: true,
        state: { expired: true, from: pathRef.current },
      });
    });

    return () => setSessionExpiredHandler(null);
  }, [navigate]);

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  // "Continue" button: ask the backend if there is a session again.
  async function recheckSession() {
    try {
      setUser(await getCurrentUser());
      setSessionExpired(false);
      return true;
    } catch {
      return false;
    }
  }

  // "Leave this page" button: give up and go to the sign-in page.
  function leaveExpiredSession() {
    userRef.current = null;
    setUser(null);
    setSessionExpired(false);
    navigate("/admin/login", { replace: true, state: { expired: true } });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        sessionExpired,
        recheckSession,
        leaveExpiredSession,
        showToast: (message, type = "success") => setToast({ message, type }),
      }}
    >
      {children}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed right-4 top-4 z-100 flex max-w-[calc(100vw-2rem)] items-center gap-4 px-5 py-4 text-body-s text-ivory shadow-xl ${
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
