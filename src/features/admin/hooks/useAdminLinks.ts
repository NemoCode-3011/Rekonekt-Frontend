import { useAuth } from "../../auth/auth-context";

export function useAdminLinks() {
  const { user } = useAuth();

  return [
    { to: "/admin/dashboard", label: "Overview" },
    { to: "/admin/exhibitions", label: "Exhibitions" },
    { to: "/admin/stories", label: "Stories" },
    ...(user?.role === "super admin"
      ? [{ to: "/admin/team", label: "Team" }]
      : []),
    { to: "/admin/settings", label: "Settings" },
  ];
}