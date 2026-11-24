import { useCallback, useEffect, useRef, useState } from "react";
import {
  FONT_WAIT_MS,
  HOLD_MS,
  READY_CAP_MS,
  REDUCED_HOLD_MS,
} from "./splashTimeline";

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Give the fonts a moment to load so the wordmark doesn't jump.
async function waitForFonts() {
  const fonts = document.fonts;
  const loading = fonts?.load
    ? Promise.all([
        fonts.load('400 80px "Newsreader"'),
        fonts.load('500 14px "Instrument Sans"'),
      ]).then(() => undefined)
    : Promise.resolve(undefined);

  await Promise.race([loading.catch(() => undefined), wait(FONT_WAIT_MS)]);
}

type Options = {
  reduced: boolean;
  homeReady: boolean;
  onFinish: () => void;
};

export function useSplashSequence({ reduced, homeReady, onFinish }: Options) {
  const [started, setStarted] = useState(false);
  const [held, setHeld] = useState(false);
  const [readyCapped, setReadyCapped] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  // 1. Wait a moment for the fonts, then the pieces start to move.
  useEffect(() => {
    let cancelled = false;

    void waitForFonts().then(() => {
      if (!cancelled) setStarted(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Let the piece play out, then hand over to the home page.
  useEffect(() => {
    if (!started) return;

    const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS;
    const heldTimer = setTimeout(() => setHeld(true), hold);
    const capTimer = setTimeout(() => setReadyCapped(true), hold + READY_CAP_MS);

    return () => {
      clearTimeout(heldTimer);
      clearTimeout(capTimer);
    };
  }, [started, reduced]);

  useEffect(() => {
    if (started && held && (homeReady || readyCapped)) finish();
  }, [started, held, homeReady, readyCapped, finish]);

  return { started, skip: finish };
}