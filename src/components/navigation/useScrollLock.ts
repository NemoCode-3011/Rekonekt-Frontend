import { useEffect } from "react";
import { useLenis } from "lenis/react";

// Stops the page scrolling behind a menu or a dialog while it is open.
// Lenis has to be told to stop as well, or it keeps scrolling the page.
export function useScrollLock(locked = true) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [locked, lenis]);
}