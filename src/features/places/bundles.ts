import type { PlaceBundle, PlaceCard } from "./types";

/** An exhibition needs at least this many places to get a tile of its own. */
export const MIN_PLACES_FOR_TILE = 2;

/** A place shown as a normal card, with the exhibition it belongs to, if any. */
export interface StandalonePlace {
  place: PlaceCard;
  partOf: string | null;
}

/** The exhibitions big enough to be shown as a tile. */
export function tilesOf(bundles: PlaceBundle[]) {
  return bundles.filter((bundle) => bundle.places.length >= MIN_PLACES_FOR_TILE);
}

/**
 * The places that are not inside a tile, in their usual order. A place that is
 * the only one in its exhibition stays a normal card with a "Part of" label.
 */
export function standalonePlaces(
  places: PlaceCard[],
  bundles: PlaceBundle[],
): StandalonePlace[] {
  const tiled = new Set(
    tilesOf(bundles).flatMap((bundle) => bundle.places.map((place) => place.id)),
  );

  const lone = new Map<number, string>();
  for (const bundle of bundles) {
    if (bundle.places.length >= MIN_PLACES_FOR_TILE) continue;
    for (const place of bundle.places) {
      if (!lone.has(place.id)) lone.set(place.id, bundle.title);
    }
  }

  return places
    .filter((place) => !tiled.has(place.id))
    .map((place) => ({ place, partOf: lone.get(place.id) ?? null }));
}

/** The full places of one exhibition, in the exhibition's order. */
export function placesInBundle(bundle: PlaceBundle, places: PlaceCard[]) {
  const byId = new Map(places.map((place) => [place.id, place] as const));

  return bundle.places.flatMap((member) => {
    const place = byId.get(member.id);
    return place ? [place] : [];
  });
}

/** The tile's picture: the exhibition's own cover, else its first place's. */
export function bundleCoverUrl(bundle: PlaceBundle) {
  return (
    bundle.cover_image_url ??
    bundle.places.find((place) => place.cover_image_url)?.cover_image_url ??
    null
  );
}