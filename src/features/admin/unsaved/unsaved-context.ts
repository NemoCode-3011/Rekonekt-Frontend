import { createContext, useContext, useEffect, useId, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

export type UnsavedContextValue = {
  hasUnsaved: boolean;
  setDirty: (key: string, dirty: boolean) => void;
  guard: (action: () => void) => void; // runs now, or after the admin confirms
};

export const UnsavedContext = createContext<UnsavedContextValue | null>(null);

// A form calls this to say whether it has changes that aren't saved yet.
export function useUnsavedChanges(dirty: boolean) {
  const context = useContext(UnsavedContext);
  const key = useId();

  useEffect(() => {
    context?.setDirty(key, dirty);
    return () => context?.setDirty(key, false);
  }, [dirty, key, context?.setDirty]); // eslint-disable-line react-hooks/exhaustive-deps
}

// For buttons such as Sign out: run the action, but ask first if needed.
export function useGuard() {
  const context = useContext(UnsavedContext);
  if (!context) throw new Error("useGuard must be used inside UnsavedChangesProvider");
  return context.guard;
}

// For links: returns a click handler that asks first if needed.
// Usage: <Link to="/x" onClick={guardedLink("/x")}>
export function useGuardedLink() {
  const guard = useGuard();
  const navigate = useNavigate();

  return (to: string) => (event: MouseEvent) => {
    // Let "open in new tab" clicks behave normally.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    guard(() => navigate(to));
  };
}