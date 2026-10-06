import { createContext, useContext } from "react";
import type { LoadStatus } from "../experience/useCachedList";
import type { Bookmark } from "./types";

export interface BookmarksContextValue {
  bookmarks: Bookmark[];
  status: LoadStatus;
  // Has the signed-in visitor saved this artifact?
  isSaved: (artifactId: number) => boolean;
  // Save the artifact, or un-save it if it is already saved.
  toggle: (artifactId: number) => Promise<void>;
}

export const BookmarksContext = createContext<BookmarksContextValue | null>(
  null,
);

export function useBookmarks() {
  const context = useContext(BookmarksContext);

  if (!context) {
    throw new Error("useBookmarks must be used inside <BookmarksProvider>");
  }

  return context;
}