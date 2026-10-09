import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignupGate({
  returnTo,
  mode = "signup",
}: {
  returnTo: string;
  mode?: "signup" | "signin";
}) {
  const signupState = { state: { from: returnTo } };
  const signInState = { state: { from: returnTo } };

  return (
    <section
      aria-labelledby="access-gate-title"
      className="border-y border-line bg-heritage-green/5 px-5 py-12 md:px-10 md:py-16"
    >
      <div className="mx-auto max-w-2xl text-center">
        <LockKeyhole aria-hidden="true" className="mx-auto size-8 text-heritage-green" />
        <h2 id="access-gate-title" className="mt-5 font-display text-heading-m">
          {mode === "signup" ? "Continue the experience." : "Sign in to continue."}
        </h2>
        <p className="mt-3 font-sans text-body-m leading-relaxed text-muted">
          {mode === "signup"
            ? "Create a free REKÒ account to unlock the full exhibition. Already have an account? Sign in instead."
            : "Your session may have expired. Sign in again to return to this exhibition."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {mode === "signup" && (
            <Link
              to="/auth/signup"
              {...signupState}
              className="inline-flex h-12 items-center bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest"
            >
              Create an account
            </Link>
          )}
          <Link
            to="/auth/login"
            {...signInState}
            className="inline-flex h-12 items-center border border-heritage-green px-6 font-sans text-body-s font-medium text-heritage-green hover:bg-heritage-green/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
