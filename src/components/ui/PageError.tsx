import { Link } from "react-router-dom";
import Button from "./Button";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  tone?: "light" | "dark";
  fullScreen?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function PageError({
  title = "Something went wrong",
  message = "We couldn't load this. Please try again.",
  onRetry = () => window.location.reload(),
  tone = "light",
  fullScreen = false,
  backTo = "/",
  backLabel = "Back to home",
}: PageErrorProps) {
  const dark = tone === "dark";

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center px-5 py-20 text-center ${
        fullScreen ? "min-h-screen" : ""
      } ${dark ? "bg-ink text-ivory" : "text-ink"}`}
    >
      <span aria-hidden="true" className="h-px w-12 bg-ochre" />

      <h2 className="mt-8 font-display text-heading-m leading-tight">
        {title}
      </h2>
      <p
        className={`mt-3 max-w-md text-body-m ${
          dark ? "text-ivory/70" : "text-muted"
        }`}
      >
        {message}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
        <Link
          to={backTo}
          className={`inline-flex h-12 items-center border px-6 text-body-s transition-colors ${
            dark
              ? "border-ivory/40 hover:border-ivory"
              : "border-ink/40 hover:border-ink"
          }`}
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
