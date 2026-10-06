import { createContext, useContext, useState, type ReactNode } from "react";
import type { DiscoverySubject } from "../types";
import DiscoveryDrawer from "../discovery/DiscoveryDrawer";

// "Context" is how React shares one thing with many components without
// passing it down by hand. Here it shares one action: open(subject).
// Any component inside the provider can call it, and the drawer appears.
interface DiscoveryContextValue {
  open: (subject: DiscoverySubject) => void;
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  // The person or place currently shown in the drawer (null = drawer closed).
  const [subject, setSubject] = useState<DiscoverySubject | null>(null);

  return (
    <DiscoveryContext.Provider value={{ open: setSubject }}>
      {children}

      {subject && (
        <DiscoveryDrawer subject={subject} onClose={() => setSubject(null)} />
      )}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);

  if (!context) {
    throw new Error("useDiscovery must be used inside <DiscoveryProvider>");
  }

  return context;
}