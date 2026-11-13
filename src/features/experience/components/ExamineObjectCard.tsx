import { Component, lazy, Suspense, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ObjectConfig } from "../../object-viewer/objects";

// The 3D scene is only downloaded when this card is on the page.
const ObjectPreview = lazy(() => import("./ObjectPreview"));

// Two quiet rings and a dot. They show while the 3D urn loads, and stay if the
// visitor's device cannot draw 3D at all.
function Rings() {
  return (
    <div className="grid size-full place-items-center">
      <div className="relative grid size-64 place-items-center md:size-80">
        <div className="absolute size-full rounded-full border border-sand/15" />
        <div className="absolute size-2/3 rounded-full border border-sand/20" />
        <div className="size-2 rounded-full bg-sand/50" />
      </div>
    </div>
  );
}

// If the 3D urn fails for any reason, the card carries on with the rings.
class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("The 3D preview could not be shown:", error);
  }

  render() {
    return this.state.failed ? <Rings /> : this.props.children;
  }
}

// A dark invitation to step into a 3D object. It sits right after the chapter's
// objects, and the chapter's opening screen links straight to it (by its id).
// The urn turning beside the words is what says "3D" before anyone reads a word.
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

      <div className="relative mx-auto max-w-7xl">
        {/* Phones: above the words. Wide screens: down the right-hand side. */}
        <div
          aria-hidden
          className="relative mb-6 h-64 md:absolute md:inset-y-0 md:right-[4%] md:mb-0 md:h-auto md:w-[40%]"
        >
          <PreviewBoundary>
            <Suspense fallback={<Rings />}>
              <ObjectPreview />
            </Suspense>
          </PreviewBoundary>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="rounded-full border border-sand/60 px-3.5 py-1.5 font-sans text-label font-medium uppercase tracking-[0.2em] text-sand">
            Interactive 3D
          </span>
          <p className="font-sans text-label font-medium uppercase tracking-[0.22em] text-ochre">
            Examine the object
          </p>
        </div>

        <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] md:max-w-[52%]">
          {object.title}
        </h2>

        <p className="mt-6 max-w-xl font-sans text-body-l text-ivory/70 md:max-w-[44%]">
          {object.teaser}
        </p>

        <Link
          to={`/experiences/${exhibitionSlug}/object/${object.key}`}
          className="group mt-12 inline-flex h-14 items-center gap-5 bg-sand px-8 font-sans text-body-s font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ivory motion-safe:animate-beacon-ring"
        >
          Explore in 3D
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </Link>

        <p className="mt-6 font-sans text-meta text-ivory/50">
          A 3D model you can turn, zoom and explore.
        </p>
      </div>
    </section>
  );
}