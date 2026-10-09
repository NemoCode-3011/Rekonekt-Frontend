import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";

// The links shown to this admin. Only a super admin sees Team.
export function useAdminLinks() {
  const { user } = useAuth();

  return [
    { to: "/admin/dashboard", label: "Overview" },
    { to: "/admin/exhibitions", label: "Exhibitions" },
    ...(user?.role === "super admin"
      ? [{ to: "/admin/team", label: "Team" }]
      : []),
    { to: "/admin/settings", label: "Settings" },
  ];
}

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const links = useAdminLinks();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-ivory lg:flex">
      <div className="px-7 pt-8">
        <NavLink
          to="/admin/dashboard"
          className="font-display text-3xl tracking-[-0.04em]"
        >
          REKÒ
        </NavLink>
        <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Studio
        </p>
      </div>

      <nav className="mt-12 flex-1 px-4" aria-label="Admin">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block border-l-2 py-2.5 pl-3 font-sans text-body-s transition-colors ${
                    isActive
                      ? "border-ochre text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-7 py-6">
        <p className="truncate font-sans text-body-s text-ink">{user?.name}</p>
        <p className="font-sans text-meta capitalize text-muted">{user?.role}</p>

        <div className="mt-4 flex gap-5 font-sans text-meta">
          <NavLink to="/" className="text-muted underline underline-offset-4 hover:text-ink">
            View site
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="text-muted underline underline-offset-4 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}