import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../services/api/client";

export type LoadStatus = "loading" | "ready" | "error";

interface State<T> {
  id: number;
  items: T[] | null;
  failed: boolean;
  error: string | null;
}

export function useCachedList<T>(
  id: number,
  fetchItems: (id: number) => Promise<T[]>,
  cache: Map<number, T[]>,
) {
  const [state, setState] = useState<State<T>>({
    id,
    items: cache.get(id) ?? null,
    failed: false,
    error: null,
  });

  useEffect(() => {
    if (cache.has(id)) return;

    let cancelled = false;

    fetchItems(id)
      .then((items) => {
        cache.set(id, items);
        if (!cancelled) setState({ id, items, failed: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            id,
            items: null,
            failed: true,
            error: getApiErrorMessage(error, "We couldn't load this information."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, fetchItems, cache]);

  // If the id changed, ignore state that belongs to the previous one.
  const current: State<T> =
    state.id === id
      ? state
      : { id, items: cache.get(id) ?? null, failed: false, error: null };

  const status: LoadStatus = current.failed
    ? "error"
    : current.items
      ? "ready"
      : "loading";

  return { items: current.items ?? [], status, error: current.error };
}