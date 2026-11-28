import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "reko:chunk-reload";
const RELOAD_WINDOW_MS = 10_000;

const isStaleFileError = (error: unknown) =>
  error instanceof Error &&
  /dynamically imported module|importing a module script failed|unable to preload/i.test(
    error.message,
  );

// Reload at most once every few seconds, so a real outage can't cause a loop.
// If storage is unavailable we don't reload at all, for the same reason.
function mayReload() {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

// After a deploy, a tab that was already open asks for page files that no
// longer exist. Reload once to pick up the new version.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithReload<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await load();
    } catch (error) {
      if (isStaleFileError(error) && mayReload()) {
        window.location.reload();
        // Keep the loading state showing until the reload happens.
        return new Promise<never>(() => {});
      }
      throw error;
    }
  });
}