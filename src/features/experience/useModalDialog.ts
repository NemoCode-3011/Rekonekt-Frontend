import { useEffect, useRef, type MouseEvent } from "react";
import { useScrollLock } from "../../components/navigation/useScrollLock";

// Shared by the picture viewer and the side drawer. Both are built on the
// browser's own <dialog>, which gives us the dark backdrop, keyboard focus
// and closing with Escape for free.
export function useModalDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Stop the page behind from scrolling while it is open.
  useScrollLock();

  useEffect(() => {
    // Open as a modal the moment the component appears.
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  // A click on the dark area outside the content lands on the dialog itself.
  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return { dialogRef, close, closeOnBackdropClick };
}