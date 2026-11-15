import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const HOME_TITLE = "REKÒ — Digital Museum of Nigerian History";

// A single-page site never reloads, so nothing tells a screen reader that the page
// has changed. When the address changes this:
//   1. sets the tab's title from the page's own heading, and
//   2. moves focus to that heading, so a screen reader reads it out and keyboard
//      users carry on from the top of the new page instead of from a link that is gone.
// The first load is left alone: the browser already announces it.
// Pages that load their content late are waited for, for up to four seconds.
export default function PageChange() {
  const { pathname } = useLocation();
  const firstLoad = useRef(true);

  useEffect(() => {
    const isFirstLoad = firstLoad.current;
    firstLoad.current = false;

    let observer: MutationObserver | undefined;
    let giveUp: number | undefined;

    const stop = () => {
      observer?.disconnect();
      window.clearTimeout(giveUp);
    };

    const settle = () => {
      const heading = document.querySelector<HTMLElement>("h1");
      const text = heading?.textContent?.trim();
      if (!heading || !text) return false;

      document.title = pathname === "/" ? HOME_TITLE : `${text} — REKÒ`;

      if (!isFirstLoad) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      return true;
    };

    if (!settle()) {
      observer = new MutationObserver(() => {
        if (settle()) stop();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      giveUp = window.setTimeout(stop, 4000);
    }

    return stop;
  }, [pathname]);

  return null;
}