import { useEffect, useState } from "react";
import { getSectionEvents } from "./api";

// omo The big date at the top of a chapter comes from the chapter's own events:
// the year of its earliest dated event (events arrive oldest first).
// If a chapter has no dated events there is simply no big date.
const cache = new Map<number, string | null>();

function toYear(eventDate: string) {
  return String(new Date(eventDate).getFullYear());
}

export function useChapterDate(sectionId: number | undefined) {
  const [loaded, setLoaded] = useState<{
    id: number;
    date: string | null;
  } | null>(null);

  useEffect(() => {
    if (sectionId === undefined || cache.has(sectionId)) return;

    let cancelled = false;

    getSectionEvents(sectionId)
      .then((events) => {
        const dated = events.find((event) => event.event_date);
        const first = dated ?? events.find((event) => event.date_display);

        const date = first
          ? dated
            ? toYear(dated.event_date as string)
            : first.date_display
          : null;

        cache.set(sectionId, date);
        if (!cancelled) setLoaded({ id: sectionId, date });
      })
      .catch(() => {
        cache.set(sectionId, null);
        if (!cancelled) setLoaded({ id: sectionId, date: null });
      });

    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  if (sectionId === undefined) return null;
  if (cache.has(sectionId)) return cache.get(sectionId) ?? null;
  return loaded?.id === sectionId ? loaded.date : null;
}
