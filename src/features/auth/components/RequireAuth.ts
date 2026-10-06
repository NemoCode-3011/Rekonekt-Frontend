import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth-context";

// Wraps pages that need a signed-in visitor. Everyone else is sent to sign
// in, and brought back here afterwards.
function RequireAuth() {
  const { user, loading } = useAuth();
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