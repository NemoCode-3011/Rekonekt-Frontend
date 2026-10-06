
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