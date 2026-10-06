import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/auth-context";

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/stories", label: "Stories" },
  { to: "/about", label: "About" },
];

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

function InitialsBadge({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-sand font-medium text-deep-forest ${
        small ? "size-10 text-label" : "size-12 text-body-s"
      }`}
    >
      {initials(name)}
    </span>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function GlobalNav() {
  const { user, loading, logout, showToast } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen, accountOpen]);

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await logout();
      setAccountOpen(false);
      setMenuOpen(false);
      showToast("You've signed out.");
      navigate("/");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Couldn't sign out. Please try again.",
        "error"
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header
      className={
        isHome
          ? "absolute inset-x-0 top-0 z-40 text-ivory"
          : "relative border-b border-line text-ink"
      }
    >
      <div className="container grid h-20 grid-cols-2 items-center md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="font-display text-heading-s tracking-wide">
          REKÒ
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-10 text-body-s md:flex"
        >
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="hover:opacity-70">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 text-body-s md:gap-6">
          <Link
            to="/search"
            aria-label="Search"
            className="p-2 transition-opacity hover:opacity-70"
          >
            <SearchIcon />
          </Link>

          {!loading && (
            <div className="hidden items-center gap-6 md:flex">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    aria-expanded={accountOpen}
                    aria-haspopup="true"
                    aria-label={`Open account menu for ${user.name}`}
                    className="flex max-w-52 items-center gap-3 rounded-full border border-current/20 p-1 pr-3 transition-colors hover:bg-ivory/10"
                  >
                    <InitialsBadge name={user.name} small />
                    <span className="hidden max-w-32 truncate lg:inline">
                      {user.name}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden
                    >
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close account menu"
                        onClick={() => setAccountOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-ivory text-ink shadow-xl shadow-ink/15">
                        <div className="flex items-center gap-3 bg-deep-forest px-5 py-5 text-ivory">
                          <InitialsBadge name={user.name} />
                          <div className="min-w-0">
                            <p className="truncate font-display text-body-m">
                              {user.name}
                            </p>
                            <p className="truncate text-meta text-ivory/70">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/account/profile"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-sand/30"
                          >
                            <span>Your profile</span>
                            <span aria-hidden className="text-muted">↗</span>
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={signingOut}
                            aria-busy={signingOut}
                            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-error transition-colors hover:bg-error/5 disabled:cursor-wait disabled:opacity-60"
                          >
                            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                            <span aria-hidden>→</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/auth/login" className="hover:opacity-70">
                    Sign in
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="rounded-full border border-current px-4 py-2 transition-colors hover:bg-ivory/10"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full border border-current/25 transition-colors hover:bg-ivory/10 md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-deep-forest text-ivory md:hidden"
        >
          <div className="container flex h-20 shrink-0 items-center justify-between">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="font-display text-heading-s tracking-wide"
            >
              REKÒ
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="grid size-10 place-items-center rounded-full border border-line-light transition-colors hover:bg-ivory/10"
            >
              <MenuIcon open />
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="container flex flex-col gap-7 pb-8 pt-7"
          >
            <div className="flex flex-col items-start gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-12 items-center py-1 font-display text-heading-s transition-colors hover:text-sand"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/search"
                onClick={() => setMenuOpen(false)}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory/10 px-4 text-body-s text-ivory/90 transition-colors hover:bg-ivory/15"
              >
                <SearchIcon />
                Search
              </Link>
            </div>

            {!loading && (
              <div className="rounded-2xl bg-ivory/8 p-5">
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <InitialsBadge name={user.name} small />
                      <div className="min-w-0">
                        <p className="truncate text-body-s font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-meta text-ivory/65">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-body-s">
                      <Link
                        to="/account/profile"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-ivory px-4 text-ink transition-colors hover:bg-sand"
                      >
                        View profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={signingOut}
                        aria-busy={signingOut}
                        className="min-h-11 px-2 text-left text-ivory/75 transition-colors hover:text-ivory disabled:cursor-wait disabled:opacity-60"
                      >
                        {signingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 text-body-s">
                    <Link
                      to="/auth/signup"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-ivory px-5 font-medium text-ink transition-colors hover:bg-sand"
                    >
                      Create account
                    </Link>
                    <Link
                      to="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex min-h-11 items-center justify-center text-ivory/75 transition-colors hover:text-ivory"
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
