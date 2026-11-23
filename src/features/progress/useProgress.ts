import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { registerUserDataCache } from "../auth/userDataCache";
import type { LoadStatus } from "../experience/useCachedList";
import { getProgress } from "./api";
import type { ProgressEntry } from "./types";
import { getApiErrorMessage } from "../../services/api/client";

// Loads the signed-in visitor's progress for the Account page.
export function useProgress() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<{
    userId: number | null;
    status: LoadStatus;
    entries: ProgressEntry[];
    error: string | null;
  }>({ userId: null, status: "loading", entries: [], error: null });

  useEffect(
    () =>
      registerUserDataCache(() => {
        setState({
          userId: null,
          status: "loading",
          entries: [],
          error: null,
        });
      }),
    [],
  );

  useEffect(() => {
    if (authLoading || userId === null) return;
    let cancelled = false;

    getProgress()
      .then((entries) => {
        if (!cancelled) {
          setState({ userId, status: "ready", entries, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            userId,
            status: "error",
            entries: [],
            error: getApiErrorMessage(error, "We couldn't load your progress."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

  return state.userId === userId
    ? userId === null && !authLoading
      ? { userId: null, status: "ready", entries: [], error: null }
      : state
    : {
        userId,
        status: "loading",
        entries: [],
        error: null,
      };
}