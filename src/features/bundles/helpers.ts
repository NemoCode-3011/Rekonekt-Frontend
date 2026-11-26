import type { Bundle } from "./types";

/** An exhibition needs at least this many items to get a tile of its own. */
export const MIN_ITEMS_FOR_TILE = 2;

export interface StandaloneItem<T> {
  item: T;
  partOf: string | null;
}

export const tilesOf = (bundles: Bundle[]) =>
  bundles.filter((bundle) => bundle.items.length >= MIN_ITEMS_FOR_TILE);

/** Items not inside a tile. A lone item keeps its card with a "Part of" label. */
export function standaloneItems<T extends { id: number }>(
  items: T[],
  bundles: Bundle[],
): StandaloneItem<T>[] {
  const tiled = new Set(
    tilesOf(bundles).flatMap((bundle) => bundle.items.map((item) => item.id)),
  );

  const lone = new Map<number, string>();
  for (const bundle of bundles) {
    if (bundle.items.length >= MIN_ITEMS_FOR_TILE) continue;
    for (const item of bundle.items) {
      if (!lone.has(item.id)) lone.set(item.id, bundle.title);
    }
  }

  return items
    .filter((item) => !tiled.has(item.id))
    .map((item) => ({ item, partOf: lone.get(item.id) ?? null }));
}

/** The full items of one exhibition, in the exhibition's order. */
export function itemsInBundle<T extends { id: number }>(
  bundle: Bundle,
  items: T[],
) {
  const byId = new Map(items.map((item) => [item.id, item] as const));
  return bundle.items.flatMap((member) => {
    const item = byId.get(member.id);
    return item ? [item] : [];
  });
}

export const bundleCoverUrl = (bundle: Bundle) =>
  bundle.cover_image_url ??
  bundle.items.find((item) => item.image_url)?.image_url ??
  null;