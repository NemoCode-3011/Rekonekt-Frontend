import { Link, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Image panel: desktop only. Replace this whole stack with the real photo later. */}
      <aside className="relative hidden overflow-hidden bg-linear-to-b from-ink via-deep-forest to-deep-forest p-12 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between">
        {/* Warm light on the horizon (Earth/Ochre) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_62%,rgba(166,106,63,0.5),transparent_55%)]" />

        {/* Layered ridges: far → near */}
        <svg
          aria-hidden
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[58%] w-full"
        >
          <path
            className="fill-heritage-green/40"
            d="M0 220 C120 160 220 200 340 150 C460 100 560 190 680 140 C740 115 780 140 800 130 L800 600 L0 600 Z"
          />
          <path
            className="fill-deep-forest/80"
            d="M0 320 C100 270 200 330 320 290 C440 250 540 320 660 280 C730 258 780 290 800 280 L800 600 L0 600 Z"
          />
          <path
            className="fill-ink/90"
            d="M0 430 C140 390 240 440 380 410 C520 380 620 450 800 400 L800 600 L0 600 Z"
          />
        </svg>

        {/* Film grain */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14] mix-blend-overlay"
        >
          <filter id="auth-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#auth-grain)" />
        </svg>

        {/* Content */}
        <Link
          to="/"
          className="relative font-display text-heading-s tracking-wide text-ivory"
        >
          REKÒ
        </Link>

        <div className="relative border-t border-line-light pt-6">
          <p className="font-display text-heading-m leading-tight text-ivory">
            Know Your Roots.
            <br />
            Own Your Future.
          </p>
          <p className="mt-4 max-w-sm text-body-s text-ivory/70">
            Exploring Nigeria's history, culture, and the stories shaping its
            present.
          </p>
        </div>
        {/* Museum plate caption (place, year, photographer) goes here once the image is in. */}
      </aside>

      {/* Form panel */}
      <main className="flex min-h-dvh flex-col px-5 py-8 md:px-10">
        <Link
          to="/"
          className="font-display text-heading-s tracking-wide text-ink lg:hidden"
        >
          REKÒ
        </Link>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
