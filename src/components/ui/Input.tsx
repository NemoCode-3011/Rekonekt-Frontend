import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: LucideIcon;
};

export default function Input({
  label,
  error,
  icon: Icon,
  type = "text",
  id,
  ...props
}: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-label font-medium uppercase tracking-widest text-muted"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          className={`h-12 w-full border bg-transparent px-4 text-body-m outline-none transition-colors focus:border-heritage-green ${
            error ? "border-error" : "border-line"
          } ${Icon ? "pl-11" : ""} ${isPassword ? "pr-12" : ""}`}
          {...props}
        />

        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted"
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-heritage-green"
          >
            {show ? (
              <EyeOff aria-hidden="true" className="size-[18px]" />
            ) : (
              <Eye aria-hidden="true" className="size-[18px]" />
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-body-s text-error">{error}</p>}
    </div>
  );
}