import { useEffect, useRef, type MouseEvent } from "react";

// Shared by the picture viewer and the side drawer. Both are built on the
// browser's own <dialog>, which gives us the dark backdrop, keyboard focus
// and closing with Escape for free.
export function useModalDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Open as a modal the moment the component appears.
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    // Stop the page behind from scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const close = () => dialogRef.current?.close();

  // A click on the dark area outside the content lands on the dialog itself.
  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return { dialogRef, close, closeOnBackdropClick };
}