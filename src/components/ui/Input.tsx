import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, type = "text", id, ...props }: Props) {
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
          } ${isPassword ? "pr-16" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 px-4 text-label font-medium uppercase tracking-widest text-muted hover:text-ink"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-body-s text-error">{error}</p>}
    </div>
  );
}