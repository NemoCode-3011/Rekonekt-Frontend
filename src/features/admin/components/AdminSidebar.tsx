import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";
import { useAdminLinks } from "../hooks/useAdminLinks";

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const links = useAdminLinks();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-deep-forest/30 bg-deep-forest text-ivory lg:flex">
      <div className="px-7 pt-8">
        <NavLink
          to="/admin/dashboard"
          className="font-display text-3xl tracking-[-0.04em] text-ivory"
        >
          REKÒ
        </NavLink>
        <p className="mt-1 font-sans text-xs font-medium uppercase tracking-[0.18em] text-ivory/60">
          Studio
        </p>
      </div>

      <nav
        className="admin-sidebar-scroll mt-12 min-h-0 flex-1 overflow-y-auto px-4"
        aria-label="Admin"
      >
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block border-l-2 py-2.5 pl-3 font-sans text-body-s transition-colors ${
                    isActive
                      ? "border-sand bg-heritage-green/50 text-ivory"
                      : "border-transparent text-ivory/70 hover:text-ivory"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-ivory/15 px-7 py-6">
        <p className="truncate font-sans text-body-s text-ivory">{user?.name}</p>
        <p className="font-sans text-meta capitalize text-ivory/60">{user?.role}</p>

        <div className="mt-4 flex gap-5 font-sans text-meta">
          <NavLink to="/" className="text-ivory/70 underline underline-offset-4 hover:text-ivory">
            View site
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="text-ivory/70 underline underline-offset-4 hover:text-ivory"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}