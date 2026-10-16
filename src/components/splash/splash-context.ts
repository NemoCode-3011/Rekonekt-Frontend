import { createContext, useContext } from "react";

export type SplashContextValue = {
  /** True once the intro has started to exit (or was never going to show). */
  introDone: boolean;
  finishIntro: () => void;
  /** Hero's image has loaded (or errored). */
  homeReady: boolean;
  markHomeReady: () => void;
};

// Defaults make Hero work even when rendered outside the provider.
export const SplashContext = createContext<SplashContextValue>({
  introDone: true,
  finishIntro: () => {},
  homeReady: true,
  markHomeReady: () => {},
});

export function useSplash() {
  return useContext(SplashContext);
}