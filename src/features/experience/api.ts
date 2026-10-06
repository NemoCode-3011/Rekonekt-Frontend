import { http } from "../../services/api/client";
import type {
  ArtifactWithMedia,
  Experience,
  ExperienceArtifact,
  ExperienceEvent,
  ExperienceMedia,
  ExperiencePerson,
  ExperiencePlace,
  ExperienceSource,
  MediaAttachment,
} from "./types";

// Every backend reply looks like { message, data }. This returns just `data`.
async function get<T>(path: string) {
  const res = await http.get<{ message: string; data: T }>(path);
  return res.data.data;
}

// ---------- The experience, and a chapter's events ----------

export function getExperienceBySlug(slug: string) {
  return get<Experience>(`/experiences/${slug}`);
}

export function getSectionEvents(sectionId: number) {
  return get<ExperienceEvent[]>(`/events/sections/${sectionId}`);
}

// ---------- Files (images, documents...) ----------

interface MediaLibrary {
  attachments: MediaAttachment[];
  media: ExperienceMedia[];
}

// The backend has no "files for this thing" endpoint, so we download the
// full attachment list and media list once and look things up here.
// We keep the request itself so everything shares one download.
let mediaLibraryRequest: Promise<MediaLibrary> | null = null;

function getMediaLibrary() {
  if (!mediaLibraryRequest) {
    mediaLibraryRequest = Promise.all([
      get<MediaAttachment[]>("/media-attachment"),
      get<ExperienceMedia[]>("/media"),
    ])
      .then(([attachments, media]) => ({ attachments, media }))
      .catch((error) => {
        mediaLibraryRequest = null; // forget the failure so the next try retries
        throw error;
      });
  }

  return mediaLibraryRequest;
}

type MediaOwner = "artifact" | "person" | "place";

// Finds the files attached to one artifact, person or place, in the order
// the editor set.
function findMedia(owner: MediaOwner, ownerId: number, library: MediaLibrary) {
  const ownerKey = `${owner}_id` as const;

  return library.attachments
    .filter((attachment) => attachment[ownerKey] === ownerId)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((attachment) =>
      library.media.find((item) => item.id === attachment.media_id),
    )
    .filter((item): item is ExperienceMedia => item !== undefined);
}

export async function getSectionArtifacts(
  sectionId: number,
): Promise<ArtifactWithMedia[]> {
  const [artifacts, library] = await Promise.all([
    get<ExperienceArtifact[]>(`/artifacts/sections/${sectionId}`),
    getMediaLibrary(),
  ]);

  return artifacts.map((artifact) => ({
    ...artifact,
    media: findMedia("artifact", artifact.id, library),
  }));
}

export async function getPersonMedia(personId: number) {
  return findMedia("person", personId, await getMediaLibrary());
}

export async function getPlaceMedia(placeId: number) {
  return findMedia("place", placeId, await getMediaLibrary());
}

// ---------- People, places and sources ----------

export function getSectionPeople(sectionId: number) {
  return get<ExperiencePerson[]>(`/sections/${sectionId}/people`);
}

export function getSectionPlaces(sectionId: number) {
  return get<ExperiencePlace[]>(`/sections/${sectionId}/places`);
}

export function getSectionSources(sectionId: number) {
  return get<ExperienceSource[]>(`/source-links/content/section/${sectionId}`);
}

export function getPersonSources(personId: number) {
  return get<ExperienceSource[]>(`/source-links/content/person/${personId}`);
}

export function getPlaceSources(placeId: number) {
  return get<ExperienceSource[]>(`/source-links/content/place/${placeId}`);
}