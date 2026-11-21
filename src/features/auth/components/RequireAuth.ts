import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth-context";
import PageError from "../../../components/ui/PageError";

// All pages that need a signed-in visitor. Everyone else is sent to sign in and back here.
function RequireAuth() {
  const { user, loading, authUnavailable, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return React.createElement(
      "p",
      {
        className:
          "grid min-h-[40svh] place-items-center font-sans text-body-s text-muted",
      },
      "Loading…"
    );
  }

  if (authUnavailable) {
    return React.createElement(PageError, {
      title: "We couldn't check your session",
      message: "We’re having trouble connecting. Try again shortly.",
      onRetry: () => {
        void refreshUser().catch(() => undefined);
      },
    });
  }

  if (!user) {
    return React.createElement(Navigate, {
      to: "/auth/login",
      replace: true,
      state: { from: location.pathname + location.search },
    });
  }

  return React.createElement(Outlet);
}

export default RequireAuth;