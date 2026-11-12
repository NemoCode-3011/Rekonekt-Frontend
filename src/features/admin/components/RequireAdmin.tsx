import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";
import PageLoader from "../../../components/ui/PageLoader";

export default function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader fullScreen label="Checking your session…" />;
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
