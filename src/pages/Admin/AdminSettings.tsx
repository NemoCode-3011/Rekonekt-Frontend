import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import { useAuth } from "../../features/auth/auth-context";
import Settings from "../Account/Settings";

const permissions = {
  admin: [
    "Create and edit exhibitions, chapters, events, artifacts, people, places and sources",
    "Publish and unpublish content",
    "Change your own name, language and password",
  ],
  "super admin": [
    "Everything an admin can do",
    "Add new admins and remove their access (Team)",
  ],
} as const;

export default function AdminSettings() {
  const { user } = useAuth();
  const role = user?.role === "super admin" ? "super admin" : "admin";

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title="Settings"
        description="Your account details and what your role lets you do."
      />

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[16rem_1fr] md:gap-16">
        <div>
          <h2 className="font-display text-heading-s">Your role</h2>
          <p className="mt-2 font-sans text-body-s capitalize text-muted">
            {role}
          </p>
        </div>

        <ul className="max-w-xl space-y-3 font-sans text-body-m text-muted">
          {permissions[role].map((item) => (
            <li key={item} className="border-l-2 border-ochre pl-4">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Settings />
    </div>
  );
}
