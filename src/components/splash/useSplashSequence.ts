import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { milestones } from "./splashMilestones";

const FONT_WAIT_MS = 250;
const IDENTITY_HOLD_MS = 900;
const READY_CAP_MS = 1400;
const REDUCED_HOLD_MS = 1100;

// Starts fast, then slows down a long way before it stops.
const COUNT_EASE = [0.2, 0, 0, 1] as const;

// Far jumps take longer than near ones, but never more than 0.9 seconds.
function legSeconds(from: number, to: number) {
  return Math.min(0.3 + Math.abs(to - from) / 4000, 0.9);
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Give the fonts a moment to load so the big number doesn't jump.
async function waitForFonts() {
  const fonts = document.fonts;
  const loading = fonts?.load
    ? Promise.all([
        fonts.load('400 120px "Newsreader"'),
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
  // The year on screen. framer-motion moves it smoothly from number to number.
  const year = useMotionValue(milestones[0].year);

  const [reached, setReached] = useState(0); // the last stop we arrived at
  const [resting, setResting] = useState(false); // true while we sit on a stop
  const [showIdentity, setShowIdentity] = useState(false);
  const [identityHeld, setIdentityHeld] = useState(false);
  const [readyCapped, setReadyCapped] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  // 1. Play the story: rest, count to the next stop, rest, and so on.
  useEffect(() => {
    let cancelled = false;
    let counting: { stop: () => void } | undefined;

    const countTo = (target: number, seconds: number) =>
      new Promise<void>((resolve) => {
        counting = animate(year, target, {
          duration: seconds,
          ease: COUNT_EASE,
          onComplete: resolve,
        });
      });

    async function play() {
      await waitForFonts();
      if (cancelled) return;

      if (reduced) {
        setShowIdentity(true);
        return;
      }

      setResting(true);
      await wait(milestones[0].holdMs);

      for (let i = 1; i < milestones.length; i++) {
        if (cancelled) return;
        setResting(false);

        await countTo(
          milestones[i].year,
          legSeconds(milestones[i - 1].year, milestones[i].year),
        );
        if (cancelled) return;

        setReached(i);
        setResting(true);
        await wait(milestones[i].holdMs);
      }

      if (cancelled) return;
      setResting(false);
      setShowIdentity(true);
    }

    void play();

    return () => {
      cancelled = true;
      counting?.stop();
    };
  }, [reduced, year]);

  // 2. Once REKÒ is showing, keep it a moment, then hand over to the home page.
  useEffect(() => {
    if (!showIdentity) return;

    const hold = reduced ? REDUCED_HOLD_MS : IDENTITY_HOLD_MS;
    const heldTimer = setTimeout(() => setIdentityHeld(true), hold);
    const capTimer = setTimeout(() => setReadyCapped(true), hold + READY_CAP_MS);

    return () => {
      clearTimeout(heldTimer);
      clearTimeout(capTimer);
    };
  }, [showIdentity, reduced]);

  useEffect(() => {
    if (showIdentity && identityHeld && (homeReady || readyCapped)) {
      finish();
    }
  }, [showIdentity, identityHeld, homeReady, readyCapped, finish]);

  return { year, reached, resting, showIdentity, skip: finish };
}