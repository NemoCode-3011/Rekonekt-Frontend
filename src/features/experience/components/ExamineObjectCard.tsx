import { Link } from "react-router-dom";
import type { ObjectConfig } from "../../object-viewer/objects";

// Three crossing orbits around a point: a quiet hint that this one can be turned.
function OrbitMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <circle cx="60" cy="60" r="5" fill="currentColor" />
      {[0, 60, 120].map((angle) => (
        <ellipse
          key={angle}
          cx="60"
          cy="60"
          rx="54"
          ry="20"
          stroke="currentColor"
          strokeWidth="1.2"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
    </svg>
  );
}

// A dark invitation to step into a 3D object. It sits right after the chapter's
// objects, and the chapter's opening screen links straight to it (by its id).
export default function ExamineObjectCard({
  object,
  exhibitionSlug,
}: {
  object: ObjectConfig;
  exhibitionSlug: string;
}) {
  return (
    <section
      id={`examine-${object.key}`}
      aria-label={`3D object: ${object.title}`}
      className="relative scroll-mt-20 overflow-hidden border-y border-sand/20 bg-[#070b08] px-5 py-20 text-ivory md:px-10 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(22,63,50,0.6),transparent_62%)]"
      />

      {/* A large, faint orbit on wide screens. It turns slowly, unless motion is reduced. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-1/2 hidden size-80 -translate-y-1/2 text-sand/30 md:block lg:size-105"
      >
        <OrbitMark className="size-full motion-safe:animate-[spin_60s_linear_infinite]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-sand/60 px-3.5 py-1.5 font-sans text-label font-medium uppercase tracking-[0.2em] text-sand">
            <OrbitMark className="size-4" />
            Interactive 3D
          </span>
          <p className="font-sans text-label font-medium uppercase tracking-[0.22em] text-ochre">
            Examine the object
          </p>
        </div>

        <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em]">
          {object.title}
        </h2>

        <p className="mt-6 max-w-xl font-sans text-body-l text-ivory/70">
          {object.teaser}
        </p>

        <Link
          to={`/experiences/${exhibitionSlug}/object/${object.key}`}
          className="group mt-10 inline-flex h-14 items-center gap-5 bg-sand px-8 font-sans text-body-s font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ivory"
        >
          Explore in 3D
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </Link>

        <p className="mt-5 font-sans text-meta text-ivory/50">
          A 3D model you can turn, zoom and explore.
        </p>
      </div>
    </section>
  );
}