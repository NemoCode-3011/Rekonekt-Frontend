import { Link, useLocation } from "react-router-dom";
import { useModalDialog } from "../../experience/useModalDialog";

interface SignInPromptProps {
  title: string;
  body: string;
  onClose: () => void;
}

function SignInPrompt({ title, body, onClose }: SignInPromptProps) {
  const { dialogRef, close, closeOnBackdropClick } = useModalDialog();
  const location = useLocation();

  // Where to come back to after signing in.
  const from = location.pathname + location.search;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={closeOnBackdropClick}
      aria-labelledby="sign-in-prompt-title"
      className="m-auto w-[calc(100vw-2rem)] max-w-sm bg-ivory p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="p-6 md:p-8">
        <h2
          id="sign-in-prompt-title"
          className="font-display text-heading-s leading-tight"
        >
          {title}
        </h2>
        <p className="mt-3 font-sans text-body-m text-muted">{body}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/auth/signup"
            state={{ from }}
            className="inline-flex h-12 items-center bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
          >
            Create account
          </Link>
          <Link
            to="/auth/login"
            state={{ from }}
            className="inline-flex h-12 items-center border border-heritage-green px-6 font-sans text-body-s font-medium text-heritage-green transition-colors hover:bg-heritage-green/5"
          >
            Sign in
          </Link>
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-5 font-sans text-body-s text-muted underline underline-offset-4 hover:text-ink"
        >
          Not now
        </button>
      </div>
    </dialog>
  );
}

export default SignInPrompt;