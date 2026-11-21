import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";
import PageLoader from "../../../components/ui/PageLoader";
import PageError from "../../../components/ui/PageError";

export default function RequireAdmin() {
  const { user, loading, authUnavailable, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader fullScreen label="Checking your session…" />;
  }

  if (authUnavailable) {
    return (
      <PageError
        title="We couldn't check your session"
        message="The sign-in service is temporarily unavailable. Try again before continuing."
        onRetry={() => {
          void refreshUser().catch(() => undefined);
        }}
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  const isAdmin = user.role === "admin" || user.role === "super admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
