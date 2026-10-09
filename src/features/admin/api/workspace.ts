import { ApiError, http } from "../../../services/api/client";
import type {
  DashboardArtifact,
  DashboardEvent,
  DashboardPerson,
  DashboardPlace,
} from "../types/dashboard";

type Values = Record<string, string>;
type Reply<T> = { message: string; data: T };

async function get<T>(path: string) {
  return (await http.get<Reply<T>>(path)).data.data;
}

async function post<T>(path: string, body: unknown) {
  return (await http.post<Reply<T>>(path, body)).data.data;
}

// Leaves out empty fields so optional values are simply not sent.
function clean(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== "" && value != null),
  );
}

export function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return slug.length >= 2 ? slug : "item";
}

// Slugs are made from the title. If one is already taken, try title-2, title-3...
async function withSlug<T>(title: string, send: (slug: string) => Promise<T>) {
  const base = slugify(title);

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await send(attempt === 1 ? base : `${base}-${attempt}`);
    } catch (error) {
      const taken =
        error instanceof ApiError &&
        (error.status === 409 || /slug|already exists/i.test(error.message));

      if (!taken || attempt === 4) throw error;
    }
  }

  throw new Error("Could not save this item.");
}

// Records an image that lives at a web address and attaches it to one item.
async function attachImage(
  values: Values,
  title: string,
  target: Record<string, number>,
) {
  if (!values.imageUrl) return;

  const mediaId = values.imageMediaId
    ? Number(values.imageMediaId)
    : (
        await post<{ id: number }>(
          "/media",
          clean({
            title: `${title} image`,
            mediaType: "image",
            fileUrl: values.imageUrl,
            sourceCredit: values.imageCredit,
            license: values.imageLicense,
          }),
        )
      ).id;

  await post("/media-attachment", { mediaId, ...target, displayOrder: 0 });
}

// ---------- Reading ----------

export interface LinkedSource {
  id: number;
  title: string;
  url: string | null;
  source_type: string | null;
}

export interface ChapterContent {
  events: DashboardEvent[];
  artifacts: DashboardArtifact[];
  people: DashboardPerson[];
  places: DashboardPlace[];
  sources: LinkedSource[];
}

// Everything that belongs to one chapter, drafts included.
export async function getChapterContent(sectionId: number): Promise<ChapterContent> {
  const [events, artifacts, people, places, links, sources] = await Promise.all([
    get<DashboardEvent[]>(`/events/admin?sectionId=${sectionId}`),
    get<DashboardArtifact[]>(`/artifacts/admin?sectionId=${sectionId}`),
    get<DashboardPerson[]>(`/admin/sections/${sectionId}/people`),
    get<DashboardPlace[]>(`/admin/sections/${sectionId}/places`),
    get<{ source_id: number; section_id: number | null }[]>("/source-links"),
    get<LinkedSource[]>("/sources"),
  ]);

  const linked = new Set(
    links.filter((link) => link.section_id === sectionId).map((link) => link.source_id),
  );

  return {
    events,
    artifacts,
    people,
    places,
    sources: sources.filter((source) => linked.has(source.id)),
  };
}

// ---------- Exhibition and chapters ----------

export async function createExhibitionFromForm(values: Values) {
  return withSlug(values.title, (slug) =>
    post<{ id: number }>(
      "/exhibitions",
      clean({
        title: values.title.trim(),
        slug,
        subtitle: values.subtitle,
        description: values.description,
        startDate: values.startDate,
        coverImageUrl: values.coverImageUrl,
      }),
    ),
  );
}

export function updateExhibition(id: number, values: Values) {
  return http.patch(
    `/exhibitions/${id}`,
    clean({
      title: values.title.trim(),
      subtitle: values.subtitle,
      description: values.description,
      coverImageUrl: values.coverImageUrl,
    }),
  );
}

export function publishExhibition(id: number) {
  return http.patch(`/exhibitions/${id}/publish`);
}

export function addChapter(exhibitionId: number, order: number, values: Values) {
  return withSlug(values.title, (slug) =>
    post("/sections", {
      exhibitionId,
      sectionOrder: order,
      slug,
      ...clean({
        title: values.title.trim(),
        introduction: values.introduction,
        heroImageUrl: values.heroImageUrl,
      }),
    }),
  );
}

export function updateChapter(id: number, values: Values) {
  return http.patch(
    `/sections/${id}`,
    clean({
      title: values.title.trim(),
      introduction: values.introduction,
      heroImageUrl: values.heroImageUrl,
    }),
  );
}

// ---------- Content inside a chapter (each one is connected for you) ----------

export function addEvent(sectionId: number, values: Values) {
  return withSlug(values.title, (slug) =>
    post("/events", {
      sectionId,
      slug,
      ...clean({
        title: values.title.trim(),
        description: values.description,
        eventDate: values.eventDate,
        dateDisplay: values.dateDisplay,
        imageUrl: values.imageUrl,
      }),
    }),
  );
}

export function addArtifact(sectionId: number, values: Values) {
  return withSlug(values.title, async (slug) => {
    const artifact = await post<{ id: number }>("/artifacts", {
      sectionId,
      slug,
      placeId: values.placeId ? Number(values.placeId) : undefined,
      ...clean({
        title: values.title.trim(),
        artifactType: values.artifactType.trim(),
        description: values.description,
        dateDisplay: values.dateDisplay,
      }),
    });

    await attachImage(values, values.title, { artifactId: artifact.id });
    return artifact;
  });
}

export function addPerson(sectionId: number, values: Values) {
  return withSlug(values.name, async (slug) => {
    const person = await post<{ id: number }>(
      "/people",
      clean({
        name: values.name.trim(),
        slug,
        description: values.description,
        birthDate: values.birthDate,
        deathDate: values.deathDate,
      }),
    );

    await post(`/sections/${sectionId}/people`, { personId: person.id, displayOrder: 0 });
    await attachImage(values, values.name, { personId: person.id });
    return person;
  });
}

export async function addPlace(sectionId: number, values: Values) {
  // One field like "6.3350, 5.6037", the way Google Maps shows coordinates.
  const match = values.coordinates.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/,
  );

  if (!match) {
    throw new Error("Enter coordinates like 6.3350, 5.6037 (copy them from Google Maps).");
  }

  const place = await post<{ id: number }>("/places", {
    latitude: Number(match[1]),
    longitude: Number(match[2]),
    ...clean({ name: values.name.trim(), description: values.description }),
  });

  await post(`/sections/${sectionId}/places`, { placeId: place.id, displayOrder: 0 });
  await attachImage(values, values.name, { placeId: place.id });
  return place;
}

// Attach a person or place that already exists.
export function linkExisting(kind: "people" | "places", sectionId: number, id: number) {
  return post(`/sections/${sectionId}/${kind}`, {
    [kind === "people" ? "personId" : "placeId"]: id,
    displayOrder: 0,
  });
}

export async function addSource(sectionId: number, values: Values) {
  const source = await post<{ id: number }>(
    "/sources",
    clean({
      title: values.title.trim(),
      sourceType: values.sourceType,
      publication: values.publication,
      url: values.url,
    }),
  );

  await post("/source-links", {
    sourceId: source.id,
    sectionId,
    relationship: "cited",
    displayOrder: 0,
  });

  return source;
}

// ---------- Publishing ----------

export type PublishKind = "events" | "artifacts" | "people" | "places";

export function setPublished(kind: PublishKind, id: number, publish: boolean) {
  return http.patch(`/${kind}/${id}/${publish ? "publish" : "unpublish"}`);
}