import { NavLink, Outlet } from "react-router-dom";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import { useAdminLinks } from "../features/admin/hooks/useAdminLinks";
import { useAuth } from "../features/auth/auth-context";
import SessionExpiredDialog from "../features/admin/components/SessionExpiredDialog";
import UnsavedChangesProvider from "../features/admin/unsaved/UnsavedChangesProvider";
import {
  useGuard,
  useGuardedLink,
} from "../features/admin/unsaved/unsaved-context";

// On small screens the sidebar is replaced by a slim bar with the same links.
function MobileBar() {
  const links = useAdminLinks();
  const { logout } = useAuth();
  const guard = useGuard();
  const guardedLink = useGuardedLink();

  return (
    <header className="border-b border-deep-forest/30 bg-deep-forest px-5 py-4 text-ivory lg:hidden">
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl tracking-[-0.04em] text-ivory">
          REKÒ
        </span>
        <button
          type="button"
          onClick={() => guard(logout)}
          className="font-sans text-meta text-ivory/70 underline underline-offset-4 hover:text-ivory"
        >
          Sign out
        </button>
      </div>

      <nav
        aria-label="Admin"
        className="mt-4 flex gap-6 overflow-x-auto whitespace-nowrap"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={guardedLink(link.to)}
            className={({ isActive }) =>
              `border-b-2 pb-1 font-sans text-body-s ${
                isActive
                  ? "border-sand text-ivory"
                  : "border-transparent text-ivory/70 hover:text-ivory"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default function AdminLayout() {
  const { sessionExpired } = useAuth();

  return (
    <UnsavedChangesProvider>
      <div className="min-h-screen bg-ivory text-ink lg:flex">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <MobileBar />
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      {sessionExpired && <SessionExpiredDialog />}
    </UnsavedChangesProvider>
  );
}
