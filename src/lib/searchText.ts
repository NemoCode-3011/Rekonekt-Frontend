const HAUSA: Record<string, string> = { ɓ: "b", ɗ: "d", ƙ: "k", ƴ: "y" };

// Lowercase, with accents and tone marks removed: "Ọ̀yọ́" becomes "oyo".
export function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ɓɗƙƴ]/g, (letter) => HAUSA[letter]);
}

export function matchesSearch(
  query: string,
  ...fields: (string | null | undefined)[]
) {
  const needle = fold(query.trim());
  if (!needle) return true;
  return fields.some((field) => field && fold(field).includes(needle));
}