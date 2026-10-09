import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

const tabs = [
  { to: "/account/profile", label: "Profile" },
  { to: "/account/progress", label: "Your progress" },
  { to: "/account/bookmarks", label: "Bookmarks" },
  { to: "/account/settings", label: "Settings" },
];

// The frame around every Account page: a heading and the page tabs.
export default function AccountLayout() {
  const { user } = useAuth();

  return (
    <div className="bg-ivory text-ink">
      <div className="container py-12 md:py-20">
        <p className="font-display text-heading-s text-ochre">Your account</p>
        <h1 className="mt-3 text-display-m leading-[0.95]">{user?.name}</h1>

        <nav
          aria-label="Account"
          className="mt-10 flex gap-8 overflow-x-auto whitespace-nowrap border-b border-line"
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `-mb-px border-b-2 pb-4 font-sans text-body-m transition-colors ${
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
