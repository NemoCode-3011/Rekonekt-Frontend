import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "../../services/api/client";
import { useAuth } from "../auth/auth-context";
import type { LoadStatus } from "../experience/useCachedList";
import { addBookmark, getBookmarks, removeBookmark } from "./api";
import { BookmarksContext } from "./bookmarks-context";
import type { Bookmark } from "./types";

interface State {
  userId: number | null; // whose bookmarks these are
  status: LoadStatus;
  bookmarks: Bookmark[];
}

// Keeps the signed-in visitor's bookmarks in one place, so the bookmark
// button, the drawer and the Account page always agree.
export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user, showToast } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<State>({
    userId: null,
    status: "loading",
    bookmarks: [],
  });

  // Load the list whenever someone signs in.
  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;

    getBookmarks()
      .then((bookmarks) => {
        if (!cancelled) setState({ userId, status: "ready", bookmarks });
      })
      .catch(() => {
        if (!cancelled) setState({ userId, status: "error", bookmarks: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // If nobody is signed in, or a different person is, this ignores the old list.
  const current: State =
    state.userId === userId
      ? state
      : {
          userId,
          status: userId === null ? "ready" : "loading",
          bookmarks: [],
        };

  async function reload() {
    if (userId === null) return;
    const bookmarks = await getBookmarks();
    setState({ userId, status: "ready", bookmarks });
  }

  async function toggle(artifactId: number) {
    const existing = current.bookmarks.find(
      (bookmark) => bookmark.artifact_id === artifactId,
    );

    try {
      if (existing) {
        await removeBookmark(existing.id);
      } else {
        await addBookmark(artifactId);
      }
    } catch (error) {
      if (!existing && error instanceof ApiError && error.status === 409) {
        try {
          await reload();
          showToast("This object is already bookmarked.");
        } catch {
          showToast(
            "We couldn't confirm this bookmark. Please try again.",
            "error",
          );
        }
        return;
      }

      showToast(
        existing
          ? "We couldn't remove this bookmark. Please try again."
          : "We couldn't add this bookmark. Please try again.",
        "error",
      );
      return;
    }

    showToast(existing ? "Bookmark removed." : "Bookmarked.");

    try {
      await reload();
    } catch {
      showToast(
        "Bookmark updated, but your list couldn't refresh. Please refresh the page.",
        "error",
      );
    }
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks: current.bookmarks,
        status: current.status,
        isSaved: (artifactId) =>
          current.bookmarks.some((bookmark) => bookmark.artifact_id === artifactId),
        toggle,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}