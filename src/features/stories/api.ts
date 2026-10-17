import { http } from "../../services/api/client";
import type { ExperienceSource } from "../../features/experience/types";
import type { DidYouKnowStory, Story, StorySummary } from "./types";

// Every backend reply looks like { message, data }.
async function get<T>(path: string) {
  const res = await http.get<{ message: string; data: T }>(path);
  return res.data.data;
}

/** Every published story, newest first. */
export function getStories() {
  return get<StorySummary[]>("/stories");
}

/** One published story. Rejects with an ApiError (status 404) if it doesn't exist. */
export function getStory(slug: string) {
  return get<Story>(`/stories/${encodeURIComponent(slug)}`);
}

/** The story of the day for the home page, or null when there isn't one yet. */
export function getDidYouKnowStory() {
  return get<DidYouKnowStory | null>("/stories/did-you-know");
}

/** The sources a story cites. */
export function getStorySources(storyId: number) {
  return get<ExperienceSource[]>(`/source-links/content/story/${storyId}`);
}

/** The address of a story's own page. Use this everywhere a story is linked. */
export function storyPath(slug: string) {
  return `/stories/${slug}`;
}