import { Link, type LinkProps } from "react-router-dom";

export default function ArrowLink({ className = "", children, ...props }: LinkProps) {
  return (
    <Link
      className={`group inline-flex items-center gap-3 border-b border-current pb-1 text-body-m font-medium ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1.5"
      >
        →
      </span>
    </Link>
  );
}