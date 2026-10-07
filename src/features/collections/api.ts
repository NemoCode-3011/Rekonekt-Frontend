import { http } from "../../services/api/client";
import { formatYear } from "../../lib/dates";
import {
  getArtifactMedia,
  getPersonMedia,
  getPlaceMedia,
} from "../experience/api";
import type {
  ExperienceArtifact,
  ExperienceEvent,
  ExperienceMedia,
  ExperiencePerson,
  ExperiencePlace,
} from "../experience/types";

export type CollectionKind = "people" | "events" | "places" | "artifacts";

// One card on a list page. Every kind (person, event, place, artifact) is
// turned into this same shape, so one page can show all of them.
export interface CollectionItem {
  id: number;
  title: string;
  meta: string | null; // the line above the title: years, date, type...
  description: string | null;
  image: string | null;
  credit: string | null; // who to thank for the image

  // Extra details, used by the "Discover differently" panels on the homepage.
  year: string | null;
  coordinates: { latitude: string; longitude: string } | null;
  type: string | null;
  dateDisplay: string | null;
  placeId: number | null;
}

function makeItem(
  partial: Pick<CollectionItem, "id" | "title"> & Partial<CollectionItem>,
): CollectionItem {
  return {
    meta: null,
    description: null,
    image: null,
    credit: null,
    year: null,
    coordinates: null,
    type: null,
    dateDisplay: null,
    placeId: null,
    ...partial,
  };
}

// Every backend reply looks like { message, data }.
async function get<T>(path: string) {
  const res = await http.get<{ message: string; data: T }>(path);
  return res.data.data;
}

// People, places and artifacts get their pictures from the media library.
// If the library can't be reached, the card is simply shown without a picture.
function firstImage(media: ExperienceMedia[]) {
  return media.find((item) => item.media_type === "image") ?? null;
}

function yearOf(date: string | null) {
  return date ? String(formatYear(date)) : null;
}

function lifeSpan(birth: string | null, death: string | null) {
  const from = yearOf(birth);
  const to = yearOf(death);

  if (from && to) return `${from} – ${to}`;
  if (from) return `Born ${from}`;
  if (to) return `Died ${to}`;
  return null;
}

function formatCoordinates(latitude: string | null, longitude: string | null) {
  if (latitude === null || longitude === null) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    latitude: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`,
    longitude: `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`,
  };
}

const loaders: Record<CollectionKind, () => Promise<CollectionItem[]>> = {
  people: async () => {
    const people = await get<ExperiencePerson[]>("/people");

    return Promise.all(
      people.map(async (person) => {
        const image = firstImage(
          await getPersonMedia(person.id).catch(() => []),
        );

        return makeItem({
          id: person.id,
          title: person.name,
          meta: lifeSpan(person.birth_date, person.death_date),
          description: person.description,
          image: image?.file_url ?? null,
          credit: image?.source_credit ?? null,
          year: yearOf(person.birth_date),
        });
      }),
    );
  },

  events: async () => {
    const events = await get<ExperienceEvent[]>("/events");

    return events.map((event) =>
      makeItem({
        id: event.id,
        title: event.title,
        meta: event.date_display ?? yearOf(event.event_date),
        description: event.description,
        image: event.image_url,
        year: yearOf(event.event_date),
        dateDisplay: event.date_display,
      }),
    );
  },

  places: async () => {
    const places = await get<ExperiencePlace[]>("/places");

    return Promise.all(
      places.map(async (place) => {
        const image = firstImage(await getPlaceMedia(place.id).catch(() => []));
        const coordinates = formatCoordinates(place.latitude, place.longitude);

        return makeItem({
          id: place.id,
          title: place.name,
          meta: coordinates
            ? `${coordinates.latitude}, ${coordinates.longitude}`
            : null,
          description: place.description,
          image: image?.file_url ?? null,
          credit: image?.source_credit ?? null,
          coordinates,
        });
      }),
    );
  },

  artifacts: async () => {
    const artifacts = await get<ExperienceArtifact[]>("/artifacts");

    return Promise.all(
      artifacts.map(async (artifact) => {
        const image = firstImage(
          await getArtifactMedia(artifact.id).catch(() => []),
        );

        return makeItem({
          id: artifact.id,
          title: artifact.title,
          meta:
            [artifact.artifact_type, artifact.date_display]
              .filter(Boolean)
              .join(" · ") || null,
          description: artifact.description ?? artifact.historical_context,
          image: image?.file_url ?? null,
          credit: image?.source_credit ?? null,
          type: artifact.artifact_type,
          dateDisplay: artifact.date_display,
          placeId: artifact.place_id,
        });
      }),
    );
  },
};

export function getCollection(kind: CollectionKind) {
  return loaders[kind]();
}
