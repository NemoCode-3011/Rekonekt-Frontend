import { NavLink, Outlet } from "react-router-dom";
import AdminSidebar, { useAdminLinks } from "../features/admin/components/AdminSidebar";
import { useAuth } from "../features/auth/auth-context";

// On small screens the sidebar is replaced by a slim bar with the same links.
function MobileBar() {
  const links = useAdminLinks();
  const { logout } = useAuth();

  return (
    <header className="border-b border-line bg-ivory px-5 py-4 lg:hidden">
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl tracking-[-0.04em]">REKÒ</span>
        <button
          type="button"
          onClick={logout}
          className="font-sans text-meta text-muted underline underline-offset-4"
        >
          Sign out
        </button>
      </div>

      <nav aria-label="Admin" className="mt-4 flex gap-6 overflow-x-auto whitespace-nowrap">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `border-b-2 pb-1 font-sans text-body-s ${
                isActive ? "border-ochre text-ink" : "border-transparent text-muted"
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
  return (
    <div className="min-h-screen bg-ivory text-ink lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <MobileBar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}