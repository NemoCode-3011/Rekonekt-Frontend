import { useState } from "react";
import { useAuth } from "../../auth/auth-context";
import { useModalDialog } from "../../experience/useModalDialog";

export default function SessionExpiredDialog() {
  const { dialogRef } = useModalDialog();
  const { recheckSession, leaveExpiredSession } = useAuth();
  const [checking, setChecking] = useState(false);
  const [stillSignedOut, setStillSignedOut] = useState(false);

  async function handleContinue() {
    setChecking(true);
    setStillSignedOut(false);

    const ok = await recheckSession();

    // On success the dialog disappears by itself.
    if (!ok) {
      setStillSignedOut(true);
      setChecking(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      onCancel={(event) => event.preventDefault()} // Escape does nothing here
      aria-labelledby="expired-title"
      aria-describedby="expired-message"
      className="m-auto w-[calc(100vw-2.5rem)] max-w-md bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/80"
    >
      <div className="border-t-2 border-ochre p-6 md:p-8">
        <h2
          id="expired-title"
          className="font-display text-heading-s leading-tight"
        >
          Your session has ended
        </h2>
        <p id="expired-message" className="mt-3 font-sans text-body-m text-muted">
          You were signed out. Nothing on this page has been lost yet. Sign in
          again in a new tab, then come back here and press Continue.
        </p>

        {stillSignedOut && (
          <p role="alert" className="mt-4 font-sans text-body-s text-error">
            We still can&rsquo;t find a signed-in session. Finish signing in
            in the new tab first, then try again.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/admin/login"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
          >
            Sign in (new tab)
          </a>
          <button
            type="button"
            onClick={handleContinue}
            disabled={checking}
            className="h-12 border border-ink/40 px-6 font-sans text-body-s transition-colors hover:border-ink disabled:opacity-60"
          >
            {checking ? "Checking…" : "Continue"}
          </button>
        </div>

        <button
          type="button"
          onClick={leaveExpiredSession}
          className="mt-6 font-sans text-body-s text-muted underline underline-offset-4 hover:text-ink"
        >
          Leave this page instead
        </button>
      </div>
    </dialog>
  );
}