import { useState } from "react";
import { useAuth } from "../../auth/auth-context";
import SignInPrompt from "../../auth/components/Signinprompt";
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

// Visitors who aren't signed in get a small prompt to create an account or
// sign in, and come back to this same page afterwards.
function SaveButton({ artifactId, tone }: SaveButtonProps) {
  const { user } = useAuth();
  const { isSaved, toggle, status } = useBookmarks();
  const [busy, setBusy] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const colors =
    tone === "dark"
      ? "text-ivory hover:bg-ivory/10"
      : "text-ink hover:bg-ink/5";
  const style = `inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${colors}`;

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPromptOpen(true)}
          aria-haspopup="dialog"
          className={style}
          aria-label="Bookmark this object"
          title="Bookmark this object"
        >
          <BookmarkIcon saved={false} />
        </button>

        {promptOpen && (
          <SignInPrompt
            title="Sign in to save this."
            body="Create a free account to bookmark stories and objects and find them later."
            onClose={() => setPromptOpen(false)}
          />
        )}
      </>
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