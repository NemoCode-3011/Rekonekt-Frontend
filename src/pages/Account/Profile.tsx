import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/auth-context";
import type { Role } from "../../features/auth/types";

const roleLabels: Record<Role, string> = {
  visitor: "Visitor",
  admin: "Administrator",
  "super admin": "Super administrator",
};

// "en" becomes "English". Falls back to the code if it isn't recognised.
function languageName(code: string) {
  try {
    return new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function Profile() {
  const { user, logout, showToast } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null; // the page is only reachable when signed in

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await logout();
      showToast("You're signed out.");
      navigate("/");
    } catch {
      showToast("We couldn't sign you out. Please try again.", "error");
      setSigningOut(false);
    }
  }

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Account type", value: roleLabels[user.role] ?? user.role },
    { label: "Language", value: languageName(user.preferred_language) },
  ];

  return (
    <div>
      <dl className="max-w-2xl divide-y divide-line border-y border-line">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr]"
          >
            <dt className="font-sans text-body-s text-muted">{detail.label}</dt>
            <dd className="font-sans text-body-m">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-10 border border-ink px-6 py-3 font-sans text-body-m transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

export default Profile;