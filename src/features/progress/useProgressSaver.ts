import { useEffect } from "react";
import { useAuth } from "../auth/auth-context";
import { saveProgress } from "./api";

// Used by the Experience page. Whenever a signed-in visitor opens a chapter,
// it is recorded. Reaching the final chapter marks the experience finished.
// Saving is quiet: if it fails, the visitor's reading is not interrupted.
export function useProgressSaver(
  exhibitionId: number | undefined,
  sectionId: number | undefined,
  isFinalChapter: boolean,
) {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !exhibitionId || !sectionId) return;

    saveProgress(exhibitionId, sectionId, isFinalChapter ? true : undefined).catch(
      () => {},
    );
  }, [userId, exhibitionId, sectionId, isFinalChapter]);
}