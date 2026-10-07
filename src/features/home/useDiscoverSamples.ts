import { useEffect, useState } from "react";
import {
  getCollection,
  type CollectionItem,
  type CollectionKind,
} from "../collections/api";

// One real person, event, place and artifact for the homepage panels.
export interface DiscoverSample extends CollectionItem {
  placeName: string | null; // only used by artifacts
}

type Samples = Record<string, DiscoverSample | null>;

// Prefer something that has a picture. Otherwise take the first one.
function pick(items: CollectionItem[]) {
  return items.find((item) => item.image) ?? items[0] ?? null;
}

async function load(kind: CollectionKind) {
  try {
    return await getCollection(kind);
  } catch {
    return [];
  }
}

export function useDiscoverSamples() {
  const [samples, setSamples] = useState<Samples>({});

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const [people, events, places, artifacts] = await Promise.all([
        load("people"),
        load("events"),
        load("places"),
        load("artifacts"),
      ]);

      const artifact = pick(artifacts);
      const place = artifact?.placeId
        ? places.find((item) => item.id === artifact.placeId)
        : null;

      if (cancelled) return;

      const withPlace = (
        item: CollectionItem | null,
        placeName: string | null,
      ) => (item ? { ...item, placeName } : null);

      setSamples({
        people: withPlace(pick(people), null),
        events: withPlace(pick(events), null),
        places: withPlace(pick(places), null),
        artifacts: withPlace(artifact, place?.title ?? null),
      });
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return samples;
}
