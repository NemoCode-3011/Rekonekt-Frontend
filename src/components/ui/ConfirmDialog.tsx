import { useModalDialog } from "../../features/experience/useModalDialog";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { dialogRef, close, closeOnBackdropClick } = useModalDialog();

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={closeOnBackdropClick}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      className="m-auto w-[calc(100vw-2.5rem)] max-w-md bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/70"
    >
      <div className="border-t-2 border-ochre p-6 md:p-8">
        <h2
          id="confirm-title"
          className="font-display text-heading-s leading-tight"
        >
          {title}
        </h2>
        <p id="confirm-message" className="mt-3 font-sans text-body-m text-muted">
          {message}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="h-12 border border-ink/40 px-6 font-sans text-body-s transition-colors hover:border-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`h-12 px-6 font-sans text-body-s font-medium text-ivory transition-colors disabled:opacity-60 ${
              danger
                ? "bg-error hover:bg-error/90"
                : "bg-heritage-green hover:bg-deep-forest"
            }`}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}