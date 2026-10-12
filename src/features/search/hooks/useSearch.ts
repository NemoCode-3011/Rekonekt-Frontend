import { useEffect, useState } from "react";
import { ApiError } from "../../../services/api/client";
import { searchContent } from "../api";
import type { SearchResult } from "../types";

// The backend refuses searches shorter than this.
export const MIN_QUERY_LENGTH = 2;

// How long to wait after the last keystroke before asking the backend.
const TYPING_PAUSE_MS = 300;

export type SearchStatus = "idle" | "ready" | "error" | "login";
export type LoginMode = "signup" | "signin";

interface Answer {
  query: string;
  failed: boolean;
  loginMode: LoginMode | null; // set when the backend asked for a login
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
          if (!cancelled) {
            setAnswer({ query, failed: false, loginMode: null, results });
          }
        })
        .catch((error) => {
          if (cancelled) return;

          // 401 means the login wall, not a broken search.
          const loginMode: LoginMode | null =
            error instanceof ApiError && error.status === 401
              ? error.code === "SIGNUP_REQUIRED"
                ? "signup"
                : "signin"
              : null;

          setAnswer({ query, failed: true, loginMode, results: [] });
        });
    }, TYPING_PAUSE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, tooShort]);

  if (tooShort) {
    return {
      status: "idle" as SearchStatus,
      loginMode: null,
      results: [],
      searching: false,
    };
  }

  const status: SearchStatus = answer?.loginMode
    ? "login"
    : answer?.failed
      ? "error"
      : "ready";

  return {
    status,
    loginMode: answer?.loginMode ?? null,
    // While a new search is on its way, the previous results stay visible.
    results: answer?.results ?? [],
    searching: answer?.query !== query,
  };
}