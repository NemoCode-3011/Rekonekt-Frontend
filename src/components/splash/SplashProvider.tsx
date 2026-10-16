import { useCallback, useMemo, useState, type ReactNode } from "react";
import { SplashContext } from "./splash-context";
import { markSplashSeen, shouldShowSplash } from "./useSplashSeen";

export function SplashProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(() => !shouldShowSplash());
  const [homeReady, setHomeReady] = useState(false);

  const finishIntro = useCallback(() => {
    markSplashSeen();
    setIntroDone(true);
  }, []);
  const markHomeReady = useCallback(() => setHomeReady(true), []);

  const value = useMemo(
    () => ({ introDone, finishIntro, homeReady, markHomeReady }),
    [introDone, finishIntro, homeReady, markHomeReady],
  );

  return <SplashContext.Provider value={value}>{children}</SplashContext.Provider>;
}