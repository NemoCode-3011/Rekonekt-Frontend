import { getSectionArtifacts } from "./api";
import type { ArtifactWithMedia } from "./types";
import { useCachedList } from "./useCachedList";

const cache = new Map<number, ArtifactWithMedia[]>();

export function useSectionArtifacts(sectionId: number) {
  return useCachedList(sectionId, getSectionArtifacts, cache);
}