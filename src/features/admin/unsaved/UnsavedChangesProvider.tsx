import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { UnsavedContext } from "./unsaved-context";

export default function UnsavedChangesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const dirtyKeys = useRef(new Set<string>());
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const setDirty = useCallback((key: string, dirty: boolean) => {
    if (dirty) dirtyKeys.current.add(key);
    else dirtyKeys.current.delete(key);
    setHasUnsaved(dirtyKeys.current.size > 0);
  }, []);

  const guard = useCallback((action: () => void) => {
    if (dirtyKeys.current.size === 0) {
      action();
      return;
    }
    setPending(() => action); // wait for the admin's answer
  }, []);

  // Refreshing or closing the tab: the browser shows its own warning.
  useEffect(() => {
    if (!hasUnsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsaved]);

  const value = useMemo(
    () => ({ hasUnsaved, setDirty, guard }),
    [hasUnsaved, setDirty, guard],
  );

  return (
    <UnsavedContext.Provider value={value}>
      {children}

      {pending && (
        <ConfirmDialog
          title="Leave without saving?"
          message="You have changes that haven't been saved. If you leave now, they will be lost."
          confirmLabel="Leave anyway"
          cancelLabel="Keep editing"
          danger
          onConfirm={() => {
            const go = pending;
            dirtyKeys.current.clear();
            setHasUnsaved(false);
            setPending(null);
            go();
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </UnsavedContext.Provider>
  );
}