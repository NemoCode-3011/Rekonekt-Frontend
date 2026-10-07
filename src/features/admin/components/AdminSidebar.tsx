import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Overview",
    path: "/admin",
  },
  {
    label: "Exhibitions",
    path: "/admin/exhibitions",
  },
  {
    label: "Events",
    path: "/admin/events",
  },
  {
    label: "People",
    path: "/admin/people",
  },
  {
    label: "Places",
    path: "/admin/places",
  },
  {
    label: "Artifacts",
    path: "/admin/artifacts",
  },
  {
    label: "Stories",
    path: "/admin/stories",
  },
  {
    label: "Sources",
    path: "/admin/sources",
  },
  {
    label: "Media",
    path: "/admin/media",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink/10 bg-deep-forest text-ivory lg:flex lg:flex-col">
      <div className="border-b border-ivory/10 px-7 py-7">
        <NavLink to="/admin" className="block">
          <span className="font-display text-4xl tracking-[-0.04em]">
            REKÒ
          </span>

          <span className="mt-1 block font-sans text-[11px] uppercase tracking-[0.18em] text-ivory/50">
            Content Studio
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 px-4 py-6" aria-label="Admin navigation">
        <p className="px-3 pb-3 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ivory/40">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                [
                  "group flex items-center px-3 py-3 font-sans text-sm transition-colors",
                  isActive
                    ? "bg-ivory text-deep-forest"
                    : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory",
                ].join(" ")
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-ivory/10 px-7 py-5">
        <NavLink
          to="/"
          className="font-sans text-xs text-ivory/50 transition-colors hover:text-ivory"
        >
          ← Back to REKÒ
        </NavLink>
      </div>
    </aside>
  );
}