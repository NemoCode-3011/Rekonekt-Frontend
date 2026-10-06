import { useState, type ReactNode } from "react";
import { useAuth } from "../../auth/auth-context";
import { loadSubject } from "./api";
import { DiscoveryContext } from "./discovery-context";
import DiscoveryDrawer from "./DiscoveryDrawer";
import type { DiscoveryRef, DiscoverySubject } from "./types";

// Wraps the whole app. Any component can ask for the side drawer to open,
// and this is the one place that shows it.
export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const { showToast } = useAuth();

  // What the drawer is showing right now (null = drawer closed).
  const [subject, setSubject] = useState<DiscoverySubject | null>(null);

  async function openRef(ref: DiscoveryRef) {
    try {
      setSubject(await loadSubject(ref));
    } catch {
      showToast("We couldn't open that. Please try again.", "error");
    }
  }

  return (
    <DiscoveryContext.Provider value={{ open: setSubject, openRef }}>
      {children}

      {subject && (
        <DiscoveryDrawer subject={subject} onClose={() => setSubject(null)} />
      )}
    </DiscoveryContext.Provider>
  );
}