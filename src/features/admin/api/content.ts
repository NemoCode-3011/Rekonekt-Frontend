import { http } from "../../../services/api/client";
import type {
  DashboardArtifact,
  DashboardEvent,
  DashboardPerson,
  DashboardPlace,
} from "../types/dashboard";
import { parseLocation } from "./location";
import { attachImage, clean, withSlug } from "./workspace";

type Values = Record<string, string>;
type Reply<T> = { message: string; data: T };

export type AdminContentKind = "events" | "people" | "places" | "artifacts";
export type AdminContentRecord =
  | DashboardEvent
  | DashboardPerson
  | DashboardPlace
  | DashboardArtifact;

async function get<T>(path: string) {
  return (await http.get<Reply<T>>(path)).data.data;
}

async function post<T>(path: string, body: unknown) {
  return (await http.post<Reply<T>>(path, body)).data.data;
}

const paths: Record<AdminContentKind, string> = {
  events: "/events",
  people: "/people",
  places: "/places",
  artifacts: "/artifacts",
};

export function listAdminContent(kind: AdminContentKind) {
  return get<AdminContentRecord[]>(`${paths[kind]}/admin`);
}

export function getAdminContent(kind: AdminContentKind, id: number) {
  return get<AdminContentRecord>(`${paths[kind]}/admin/${id}`);
}

export function createAdminEvent(values: Values) {
  return withSlug(values.title, (slug) =>
    post<DashboardEvent>(
      paths.events,
      clean({
        title: values.title.trim(),
        slug,
        description: values.description,
        eventDate: values.eventDate,
        dateDisplay: values.dateDisplay,
        imageUrl: values.imageUrl,
      }),
    ),
  );
}

export function updateAdminEvent(id: number, values: Values) {
  return http.patch(
    `${paths.events}/${id}`,
    clean({
      title: values.title.trim(),
      description: values.description,
      eventDate: values.eventDate,
      dateDisplay: values.dateDisplay,
      imageUrl: values.imageUrl,
    }),
  );
}

export function setEventSection(id: number, sectionId: number | null) {
  return http.patch(`${paths.events}/${id}`, { sectionId });
}

export function createAdminPerson(values: Values) {
  return withSlug(values.name, (slug) =>
    post<DashboardPerson>(
      paths.people,
      clean({
        name: values.name.trim(),
        slug,
        description: values.description,
        birthDate: values.birthDate,
        deathDate: values.deathDate,
      }),
    ).then(async (person) => {
      const imageAttachmentError = await attachImageAndReport(
        values,
        values.name,
        { personId: person.id },
      );
      return imageAttachmentError
        ? { ...person, imageAttachmentError }
        : person;
    }),
  );
}

export function updateAdminPerson(id: number, values: Values) {
  return http.patch(
    `${paths.people}/${id}`,
    clean({
      name: values.name.trim(),
      description: values.description,
      birthDate: values.birthDate,
      deathDate: values.deathDate,
    }),
  );
}

export function createAdminArtifact(values: Values) {
  return withSlug(values.title, (slug) =>
    post<DashboardArtifact>(
      paths.artifacts,
      clean({
        title: values.title.trim(),
        slug,
        artifactType: values.artifactType.trim(),
        description: values.description,
        historicalContext: values.historicalContext,
        dateDisplay: values.dateDisplay,
      }),
    ).then(async (artifact) => {
      const imageAttachmentError = await attachImageAndReport(
        values,
        values.title,
        { artifactId: artifact.id },
      );
      return imageAttachmentError
        ? { ...artifact, imageAttachmentError }
        : artifact;
    }),
  );
}

export function updateAdminArtifact(id: number, values: Values) {
  return http.patch(
    `${paths.artifacts}/${id}`,
    clean({
      title: values.title.trim(),
      artifactType: values.artifactType.trim(),
      description: values.description,
      historicalContext: values.historicalContext,
      dateDisplay: values.dateDisplay,
    }),
  );
}

export function createAdminPlace(values: Values) {
  const location = parseLocation(values.coordinates ?? "");
  if (!location) {
    throw new Error("Choose a location on the map or enter coordinates.");
  }

  const coverImageUrl = values.coverImageUrl || values.imageUrl;
  const payload = clean({
    name: values.name.trim(),
    slug: values.slug?.trim(),
    summary: values.summary?.trim(),
    region: values.region,
    category: values.category,
    description: values.description,
    latitude: location.latitude,
    longitude: location.longitude,
    coverImageUrl,
    coverImageAlt: values.coverImageAlt?.trim(),
    coverImageCredit:
      values.coverImageCredit?.trim() || values.imageCredit?.trim(),
  });

  return post<DashboardPlace>(paths.places, payload).then(async (place) => {
    const imageAttachmentError = await attachImageAndReport(
      {
        ...values,
        imageUrl: coverImageUrl ?? "",
        imageCredit: values.coverImageCredit || values.imageCredit || "",
      },
      values.name,
      { placeId: place.id },
    );

    return imageAttachmentError ? { ...place, imageAttachmentError } : place;
  });
}

export async function updateAdminPlace(
  id: number,
  values: Values,
): Promise<{ imageAttachmentError?: string }> {
  const location = parseLocation(values.coordinates ?? "");
  if (!location) throw new Error("A place must always have a map location.");

  const coverImageUrl = values.coverImageUrl || values.imageUrl;
  await http.patch(`${paths.places}/${id}`, {
    name: values.name.trim(),
    // A blank slug means "keep the current slug". The API does not accept null.
    ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
    summary: values.summary?.trim() || null,
    region: values.region || null,
    category: values.category || null,
    description: values.description || null,
    latitude: location.latitude,
    longitude: location.longitude,
    coverImageUrl: coverImageUrl || null,
    coverImageAlt: values.coverImageAlt?.trim() || null,
    coverImageCredit:
      values.coverImageCredit?.trim() || values.imageCredit?.trim() || null,
  });

  // Only attach a new upload. The existing cover URL is already saved on the
  // place and must not create another attachment every time the form is saved.
  if (!values.imageMediaId || !coverImageUrl) return {};

  const imageAttachmentError = await attachImageAndReport(
    {
      ...values,
      imageUrl: coverImageUrl,
      imageCredit: values.coverImageCredit || values.imageCredit || "",
    },
    values.name,
    { placeId: id },
  );

  return imageAttachmentError ? { imageAttachmentError } : {};
}

async function attachImageAndReport(
  values: Values,
  title: string,
  target: Record<string, number>,
) {
  try {
    await attachImage(values, title, target);
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Could not attach the image.";
  }
}

export function setAdminContentPublished(
  kind: AdminContentKind,
  id: number,
  publish: boolean,
) {
  return http.patch(
    `${paths[kind]}/${id}/${publish ? "publish" : "unpublish"}`,
  );
}

export function deleteAdminContent(kind: AdminContentKind, id: number) {
  return http.delete(`${paths[kind]}/${id}`);
}

export function getAdminEventPeople(eventId: number) {
  return get<DashboardPerson[]>(`/admin/events/${eventId}/people`);
}

export function getAdminEventPlaces(eventId: number) {
  return get<DashboardPlace[]>(`/admin/events/${eventId}/places`);
}

export function linkEventPerson(eventId: number, personId: number) {
  return post(`/events/${eventId}/people`, { personId });
}

export function unlinkEventPerson(eventId: number, personId: number) {
  return http.delete(`/events/${eventId}/people/${personId}`);
}

export function linkEventPlace(eventId: number, placeId: number) {
  return post(`/events/${eventId}/places`, { placeId });
}

export function unlinkEventPlace(eventId: number, placeId: number) {
  return http.delete(`/events/${eventId}/places/${placeId}`);
}
