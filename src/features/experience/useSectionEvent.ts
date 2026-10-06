import { getSectionEvents } from "./api";
import type { ExperienceEvent } from "./types";
import { useCachedList } from "./useCachedList";

const cache = new Map<number, ExperienceEvent[]>();

export function useSectionEvents(sectionId: number) {
  return useCachedList(sectionId, getSectionEvents, cache);
}