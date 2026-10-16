const KEY = "reko:splash-seen";

/**
 * Only on a first load at "/", once per session.
 * Add ?splash to the URL to force it while you tune the motion.
 */
export function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname !== "/") return false;
  if (new URLSearchParams(window.location.search).has("splash")) return true;
  try {
    return sessionStorage.getItem(KEY) !== "yes";
  } catch {
    return true;
  }
}

export function markSplashSeen() {
  try {
    sessionStorage.setItem(KEY, "yes");
  } catch {
    /* storage unavailable, fine */
  }
}