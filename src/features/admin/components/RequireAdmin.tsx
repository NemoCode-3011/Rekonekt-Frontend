import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";

export default function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="grid min-h-[40svh] place-items-center font-sans text-body-s text-muted">
        Loading…
      </p>
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
