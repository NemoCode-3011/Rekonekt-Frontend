const clearers = new Set<() => void>();

export function registerUserDataCache(clear: () => void) {
  clearers.add(clear);
  return () => {
    clearers.delete(clear);
  };
}

export function clearUserDataCaches() {
  for (const clear of clearers) clear();
}
