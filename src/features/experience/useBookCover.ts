import { useEffect, useState, type SyntheticEvent } from "react";
import type { ExperienceSource } from "./types";

// Remembers each answer so a book is only looked up once per visit.
const lookups = new Map<string, Promise<string | null>>();

interface BooksResponse {
  items?: { volumeInfo?: { imageLinks?: { thumbnail?: string } } }[];
}

// Asks Google Books for a cover, using the title and the author's surname.
async function lookUp(title: string, author: string | null) {
  try {
    const shortTitle = title.split(":")[0].replace(/\(.*?\)/g, "").trim();
    const surname = author
      ?.replace(/\(.*?\)/g, "")
      .split(/ and |,/)[0]
      .trim()
      .split(" ")
      .pop();

    const query = `intitle:"${shortTitle}"${surname ? ` inauthor:${surname}` : ""}`;
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=3&fields=items(volumeInfo(imageLinks))`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as BooksResponse;
    const link = data.items
      ?.map((item) => item.volumeInfo?.imageLinks?.thumbnail)
      .find(Boolean);

    return link ? link.replace("http://", "https://") : null;
  } catch {
    return null;
  }
}

function findCover(source: ExperienceSource) {
  // Only books have a cover worth looking for.
  if (source.source_type !== "book") return Promise.resolve(null);

  const key = `${source.title}|${source.author ?? ""}`;
  if (!lookups.has(key)) lookups.set(key, lookUp(source.title, source.author));
  return lookups.get(key)!;
}

// Picks the cover to show, trying three things in order:
//   1. the cover saved with the source,
//   2. a cover found by title and author,
//   3. nothing (the page shows a designed tile instead).
export function useBookCover(source: ExperienceSource) {
  const saved = source.cover_image_url;
  const [stage, setStage] = useState<"saved" | "lookup" | "none">(
    saved ? "saved" : "lookup",
  );
  const [found, setFound] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== "lookup") return;
    let cancelled = false;

    findCover(source).then((url) => {
      if (cancelled) return;
      if (url) setFound(url);
      else setStage("none");
    });

    return () => {
      cancelled = true;
    };
  }, [stage, source]);

  const src = stage === "saved" ? saved : stage === "lookup" ? found : null;

  // The picture failed to load: move on to the next option.
  function fail() {
    setStage(stage === "saved" ? "lookup" : "none");
  }

  return {
    src,
    onError: fail,
    // Some sites answer with a 1-pixel "no cover" picture. Treat it as a miss.
    onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
      if (event.currentTarget.naturalWidth <= 1) fail();
    },
  };
}