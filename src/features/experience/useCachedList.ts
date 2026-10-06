import { useEffect, useState } from "react";

export type LoadStatus = "loading" | "ready" | "error";

interface State<T> {
  id: number;
  items: T[] | null;
  failed: boolean;
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
  });

  useEffect(() => {
    if (cache.has(id)) return;

    let cancelled = false;

    fetchItems(id)
      .then((items) => {
        cache.set(id, items);
        if (!cancelled) setState({ id, items, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ id, items: null, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [id, fetchItems, cache]);

  // If the id changed, ignore state that belongs to the previous one.
  const current: State<T> =
    state.id === id
      ? state
      : { id, items: cache.get(id) ?? null, failed: false };

  const status: LoadStatus = current.failed
    ? "error"
    : current.items
      ? "ready"
      : "loading";

  return { items: current.items ?? [], status };
}