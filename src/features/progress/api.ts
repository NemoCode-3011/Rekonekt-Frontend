import { ApiError, http } from "../../services/api/client";
import { getData } from "../../services/api/request";
import type { ProgressEntry } from "./types";

export function getProgress() {
  return getData<ProgressEntry[]>("/progress");
}

// Records where a signed-in visitor is in an exhibition.
// The first visit creates the record, and later visits update it.
// Leaving `completed` out keeps whatever it was before, so a finished
// experience is never marked unfinished by looking at an earlier chapter.
export async function saveProgress(
  exhibitionId: number,
  sectionId: number,
  completed?: boolean,
) {
  try {
    await http.patch(`/progress/${exhibitionId}`, { sectionId, completed });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      await http.post("/progress", { exhibitionId, sectionId, completed });
      return;
    }
    throw error;
  }
}