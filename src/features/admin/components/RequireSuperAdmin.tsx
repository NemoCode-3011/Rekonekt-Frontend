import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";

// Only a super admin may open the pages inside this route.
export default function RequireSuperAdmin() {
  const { user } = useAuth();

  if (user?.role !== "super admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}