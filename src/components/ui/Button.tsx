import type { ButtonHTMLAttributes } from "react";

export default function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-12 bg-heritage-green px-6 text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}