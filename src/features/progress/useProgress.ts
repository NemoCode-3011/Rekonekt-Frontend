import { useEffect, useState } from "react";
import type { LoadStatus } from "../experience/useCachedList";
import { getProgress } from "./api";
import type { ProgressEntry } from "./types";

// Loads the signed-in visitor's progress for the Account page.
export function useProgress() {
  const [state, setState] = useState<{
    status: LoadStatus;
    entries: ProgressEntry[];
  }>({ status: "loading", entries: [] });

  useEffect(() => {
    let cancelled = false;

    getProgress()
      .then((entries) => {
        if (!cancelled) setState({ status: "ready", entries });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", entries: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}