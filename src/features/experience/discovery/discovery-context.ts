import { createContext, useContext } from "react";
import type { DiscoveryRef, DiscoverySubject } from "./types";

export interface DiscoveryContextValue {
  // Open the drawer with a record we already have in full.
  open: (subject: DiscoverySubject) => void;
  // Open the drawer with only a pointer. The record is fetched first.
  openRef: (ref: DiscoveryRef) => Promise<void>;
}

export const DiscoveryContext = createContext<DiscoveryContextValue | null>(
  null,
);

export function useDiscovery() {
  const context = useContext(DiscoveryContext);

  if (!context) {
    throw new Error("useDiscovery must be used inside <DiscoveryProvider>");
  }

  return context;
}
