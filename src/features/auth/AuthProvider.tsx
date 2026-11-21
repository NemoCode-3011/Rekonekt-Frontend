import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutRequest } from "./api";
import type { User } from "./types";
import { AuthContext, type Toast } from "./auth-context";
import { ApiError, setSessionExpiredHandler } from "../../services/api/client";
import { clearUserDataCaches } from "./userDataCache";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  // The session-expired handler runs outside React's rendering, so it reads
  // the latest user and page from refs.
  const userRef = useRef<User | null>(null);
  const pathRef = useRef("/");
  const authRequestId = useRef(0);

  const setAuthUser = useCallback((nextUser: User | null) => {
    if (userRef.current?.id !== nextUser?.id) clearUserDataCaches();
    userRef.current = nextUser;
    setUser(nextUser);
  }, []);

  const clearLocalSession = useCallback(() => {
    authRequestId.current += 1;
    clearUserDataCaches();
    userRef.current = null;
    setUser(null);
    setLoading(false);
    setAuthUnavailable(false);
    setSessionExpired(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const requestId = ++authRequestId.current;
    clearUserDataCaches();
    userRef.current = null;
    setUser(null);
    setLoading(true);
    setAuthUnavailable(false);
    try {
      const currentUser = await getCurrentUser();
      if (requestId !== authRequestId.current) {
        throw new Error("Authentication state changed while loading.");
      }
      setAuthUser(currentUser);
      setAuthUnavailable(false);
      return currentUser;
    } catch (error) {
      if (requestId === authRequestId.current) {
        setAuthUser(null);
        setAuthUnavailable(
          !(error instanceof ApiError && error.status === 401),
        );
      }
      throw error;
    } finally {
      if (requestId === authRequestId.current) setLoading(false);
    }
  }, [setAuthUser]);

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
    try {
      window.localStorage.removeItem("reko:last-user");
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }

    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setAuthUser(currentUser);
          setAuthUnavailable(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAuthUser(null);
          setAuthUnavailable(
            !(error instanceof ApiError && error.status === 401),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setAuthUser]);

  // If a signed-in visitor's session ends, send them to sign in again.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (!userRef.current) return; // guests have no session to lose

      // In the admin, keep the page open so nothing typed is lost.
      if (pathRef.current.startsWith("/admin")) {
        setSessionExpired(true);
        return;
      }

      clearLocalSession();
      navigate("/auth/login", {
        replace: true,
        state: { expired: true, from: pathRef.current },
      });
    });

    return () => setSessionExpiredHandler(null);
  }, [clearLocalSession, navigate]);

  async function logout() {
    clearLocalSession();
    await logoutRequest();
  }

  // "Continue" button: ask the backend if there is a session again.
  async function recheckSession() {
    try {
      await refreshUser();
      setSessionExpired(false);
      return true;
    } catch {
      return false;
    }
  }

  // "Leave this page" button: give up and go to the sign-in page.
  function leaveExpiredSession() {
    clearLocalSession();
    navigate("/admin/login", { replace: true, state: { expired: true } });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authUnavailable,
        setUser: setAuthUser,
        refreshUser,
        clearLocalSession,
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
