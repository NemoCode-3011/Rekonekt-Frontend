import { http } from "../../../services/api/client";
import { parseLocation } from "./location";
export { parseLocation } from "./location";
import { clean, withSlug } from "./workspace";

type Values = Record<string, string>;
type Reply<T> = { message: string; data: T };

export interface WonderReference {
  id: number;
  label: string;
  url: string;
  note: string | null;
  display_order: number;
}

/** A hidden wonder as the admin screens see it, drafts included. */
export interface AdminWonder {
  id: number;
  title: string;
  slug: string;
  wonder_type: string;
  summary: string | null;
  content: string | null;
  region: string | null;
  // The database sends decimals as text, for example "6.3700000".
  latitude: string | number | null;
  longitude: string | number | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
  video_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Only the single-wonder request includes these, not the list.
  references?: WonderReference[];
}

async function get<T>(path: string) {
  return (await http.get<Reply<T>>(path)).data.data;
}

export const listAdminWonders = () => get<AdminWonder[]>("/wonders/admin");

export const getAdminWonder = (id: number) =>
  get<AdminWonder>(`/wonders/admin/${id}`);

/** Turns the "Learn more" rows into what the backend expects. Blank rows are skipped. */
function readJson(json: string | undefined): unknown {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseLinks(json: string | undefined) {
  const rows = readJson(json);

  if (!Array.isArray(rows)) return [];
  // ...rest unchanged

  const links: { label: string; url: string; note?: string }[] = [];

  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row?.label ?? "").trim();
    let url = String(row?.url ?? "").trim();
    const note = String(row?.note ?? "").trim();

    if (!label && !url && !note) continue;

    if (!label || !url) {
      throw new Error("Each link needs both a name and a web address.");
    }

    // "obuduranch.com" is fine: add the https:// for them.
    if (!/^https?:\/\//i.test(url)) {
      if (/^[^\s/]+\.[^\s/]+/.test(url)) {
        url = `https://${url}`;
      } else {
        throw new Error(`"${url}" doesn't look like a web address.`);
      }
    }

    links.push({ label, url, ...(note ? { note } : {}) });
  }

  return links;
}

const text = (value?: string) => value?.trim() || null;

// Turns the form's values into what the backend expects. An emptied field is sent
// as null, which clears it on the wonder.
function body(values: Values) {
  const pin = parseLocation(values.location ?? "");

  return {
    title: values.title?.trim(),
    wonderType: values.wonderType,
    summary: text(values.summary),
    content: text(values.content),
    region: text(values.region),
    latitude: pin?.latitude ?? null,
    longitude: pin?.longitude ?? null,
    coverImageUrl: values.coverImageUrl || null,
    coverImageAlt: text(values.coverImageAlt),
    coverImageCredit: text(values.imageCredit),
    videoUrl: text(values.videoUrl),
    references: parseLinks(values.references),
  };
}

/** Creates a draft. The new wonder is opened next, to fill in the rest. */
export function createAdminWonder(values: Values) {
  return withSlug(values.title, async (slug) => {
    const res = await http.post<Reply<{ id: number }>>("/wonders", {
      slug,
      // A new wonder has nothing to clear, so empty fields are just left out.
      ...clean(body(values)),
    });
    return res.data.data;
  });
}

/** Saves the details. The slug is not changed, so the wonder's address stays the same. */
export function updateAdminWonder(id: number, values: Values) {
  return http.patch(`/wonders/${id}`, body(values));
}

export function setWonderPublished(id: number, publish: boolean) {
  return http.patch(`/wonders/${id}/${publish ? "publish" : "unpublish"}`);
}

export function deleteAdminWonder(id: number) {
  return http.delete(`/wonders/${id}`);
}