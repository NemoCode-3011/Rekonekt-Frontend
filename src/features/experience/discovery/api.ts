import { getData } from "../../../services/api/request";
import type {
  ExperienceArtifact,
  ExperienceEvent,
  ExperiencePerson,
  ExperiencePlace,
} from "../types";
import type { DiscoveryRef, DiscoverySubject, ExperienceStory } from "./types";

// Turns a pointer into the full record, ready for the drawer.
export async function loadSubject(ref: DiscoveryRef): Promise<DiscoverySubject> {
  switch (ref.kind) {
    case "person":
      return {
        kind: "person",
        person: await getData<ExperiencePerson>(
          `/people/${encodeURIComponent(ref.slug)}`,
        ),
      };
    case "artifact":
      return {
        kind: "artifact",
        artifact: await getData<ExperienceArtifact>(
          `/artifacts/${encodeURIComponent(ref.slug)}`,
        ),
      };
    case "story":
      return {
        kind: "story",
        story: await getData<ExperienceStory>(
          `/stories/${encodeURIComponent(ref.slug)}`,
        ),
      };
    case "event":
      return {
        kind: "event",
        event: await getData<ExperienceEvent>(`/events/${ref.id}`),
      };
    case "place":
      return {
        kind: "place",
        place: await getData<ExperiencePlace>(`/places/${ref.id}`),
      };
  }
}