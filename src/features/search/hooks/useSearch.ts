import { useEffect, useState } from "react";
import { searchContent } from "../api";
import type { SearchResult } from "../types";

// The backend refuses searches shorter than this.
export const MIN_QUERY_LENGTH = 2;

// How long to wait after the last keystroke before asking the backend.
const TYPING_PAUSE_MS = 300;

export type SearchStatus = "idle" | "ready" | "error";

interface Answer {
  query: string;
  failed: boolean;
  results: SearchResult[];
}

export function useSearch(rawQuery: string) {
  const query = rawQuery.trim();
  const tooShort = query.length < MIN_QUERY_LENGTH;

  // The most recent answer from the backend.
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    if (tooShort) return;

    // `cancelled` stops a slow, outdated answer from replacing a newer one.
    let cancelled = false;

    const timer = window.setTimeout(() => {
      searchContent(query)
        .then((results) => {
          if (!cancelled) setAnswer({ query, failed: false, results });
        })
        .catch(() => {
          if (!cancelled) setAnswer({ query, failed: true, results: [] });
        });
    }, TYPING_PAUSE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, tooShort]);

  if (tooShort) {
    return { status: "idle" as SearchStatus, results: [], searching: false };
  }

  const status: SearchStatus = answer?.failed ? "error" : "ready";

  return {
    status,
    // While a new search is on its way, the previous results stay visible.
    results: answer?.results ?? [],
    searching: answer?.query !== query,
  };
}
