import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";
import { useBookmarks } from "../bookmarks-context";

interface SaveButtonProps {
  artifactId: number;
  // "dark" for dark object rooms, "light" for the ivory drawer.
  tone: "dark" | "light";
}

function BookmarkIcon({ saved }: { saved: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={saved ? "currentColor" : "none"}
      className="h-6 w-6"
    >
      <path
        d="M6.75 4.75h10.5a1 1 0 0 1 1 1v14l-6.25-4-6.25 4v-14a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Visitors who aren't signed in are invited to sign in and return to this page.
function SaveButton({ artifactId, tone }: SaveButtonProps) {
  const { user } = useAuth();
  const { isSaved, toggle, status } = useBookmarks();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  const colors =
    tone === "dark"
      ? "text-ivory hover:bg-ivory/10"
      : "text-ink hover:bg-ink/5";
  const style = `inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${colors}`;

  if (!user) {
    return (
      <Link
        to="/auth/login"
        state={{ from: location.pathname + location.search }}
        className={style}
        aria-label="Sign in to bookmark this object"
        title="Sign in to bookmark"
      >
        <BookmarkIcon saved={false} />
      </Link>
    );
  }

  const saved = isSaved(artifactId);

  async function handleClick() {
    setBusy(true);
    try {
      await toggle(artifactId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={busy || status === "loading"}
      onClick={handleClick}
      className={`${style} disabled:opacity-50`}
      aria-label={
        saved ? "Remove bookmark" : "Bookmark this object"
      }
      title={saved ? "Remove bookmark" : "Bookmark this object"}
    >
      <BookmarkIcon saved={saved} />
    </button>
  );
}

export default SaveButton;