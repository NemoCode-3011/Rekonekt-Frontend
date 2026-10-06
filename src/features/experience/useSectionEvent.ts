import { useEffect, useState } from "react";
import { getSectionEvents } from "./api";
import type { ExperienceEvent } from "./types";

export type LoadStatus = "loading" | "ready" | "error";

const cache = new Map<number, ExperienceEvent[]>();

interface State {
  sectionId: number;
  events: ExperienceEvent[] | null;
  failed: boolean;
}

export function useSectionEvents(sectionId: number) {
  const [state, setState] = useState<State>({
    sectionId,
    events: cache.get(sectionId) ?? null,
    failed: false,
  });

  useEffect(() => {
    if (cache.has(sectionId)) return;

    let cancelled = false;

    getSectionEvents(sectionId)
      .then((events) => {
        cache.set(sectionId, events);
        if (!cancelled) setState({ sectionId, events, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ sectionId, events: null, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  // If the chapter changed, ignore state that belongs to the previous one.
  const current: State =
    state.sectionId === sectionId
      ? state
      : { sectionId, events: cache.get(sectionId) ?? null, failed: false };

  const status: LoadStatus = current.failed
    ? "error"
    : current.events
      ? "ready"
      : "loading";

  return { events: current.events ?? [], status };
}