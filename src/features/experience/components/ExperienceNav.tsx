import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";

interface ExperienceNavProps {
  title: string;
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ExperienceNav({ title }: ExperienceNavProps) {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Dark background once scrolled; slide away on scroll down, back on scroll up
  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY && y > 200);
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-ivory transition-all duration-300 focus-within:translate-y-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "bg-ink/85 backdrop-blur-md" : ""}`}
    >
      <div className="container grid h-14 grid-cols-2 items-center md:h-20 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="font-display text-heading-s tracking-wide">
          REKÒ
        </Link>

        <span className="hidden max-w-xs truncate text-label uppercase tracking-[0.14em] text-ivory/60 md:block">
          {title}
        </span>

        <div className="flex items-center justify-end gap-4 text-body-s">
          <Link to="/search" aria-label="Search" className="p-2 hover:opacity-70">
            <SearchIcon />
          </Link>

          {!loading &&
            (user ? (
              <Link
                to="/account/profile"
                aria-label={`Your account, ${user.name}`}
                className="grid size-10 place-items-center rounded-full bg-sand text-label font-medium text-deep-forest transition-opacity hover:opacity-80"
              >
                {initials(user.name)}
              </Link>
            ) : (
              <Link to="/auth/login" className="hover:opacity-70">
                Sign in
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}

export default ExperienceNav;