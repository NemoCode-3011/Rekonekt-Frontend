// Years are read with `new Date(...)`, the same way the Explore page does it.
// A DATE column can arrive a day off depending on the server timezone, which
// only matters for dates right on 1 January or 31 December.
export function formatYear(date: string) {
  return new Date(date).getFullYear();
}

export function formatYearRange(start: string | null, end: string | null) {
  const from = start ? formatYear(start) : null;
  const to = end ? formatYear(end) : null;

  if (from && to) return from === to ? String(from) : `${from}–${to}`;
  if (from || to) return String(from ?? to);
  return null;
}

export function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}