import { WONDER_TYPES, type WonderType } from "./types";

type Coordinate = string | number | null | undefined;

// The database sends decimals as text ("6.3700000"), so both forms are read.
function toNumber(value: Coordinate) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** Where to put the pin, or null when there is no usable position. */
export function pinOf(item: { latitude: Coordinate; longitude: Coordinate }) {
  const latitude = toNumber(item.latitude);
  const longitude = toNumber(item.longitude);

  if (latitude === null || longitude === null) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

/** The kinds that at least one wonder belongs to, in the usual order. */
export function typesPresent(items: { wonder_type: string }[]): WonderType[] {
  return WONDER_TYPES.filter((type) =>
    items.some((item) => item.wonder_type === type),
  );
}

export function countOfType(items: { wonder_type: string }[], type: WonderType) {
  return items.filter((item) => item.wonder_type === type).length;
}

/** Everything when no kind is chosen, otherwise only that kind. */
export function filterByType<T extends { wonder_type: string }>(
  items: T[],
  type: WonderType | null,
) {
  return type ? items.filter((item) => item.wonder_type === type) : items;
}

/** The address if it is a normal web link, otherwise null. */
export function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** "obuduranch.com" for a link, shown under its name. */
export function hostOf(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** True only for the privacy-friendly YouTube address the backend sends. */
export function isYouTubeEmbed(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.youtube-nocookie.com" &&
      url.pathname.startsWith("/embed/")
    );
  } catch {
    return false;
  }
}

/** The browse page's map, with this wonder already chosen. */
export function mapLinkFor(slug: string) {
  return `/wonders?view=map&wonder=${encodeURIComponent(slug)}`;
}