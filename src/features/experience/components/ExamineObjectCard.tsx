import { Link } from "react-router-dom";
import type { ObjectConfig } from "../../object-viewer/objects";

// A dark, quiet invitation at the end of a chapter: step into the gallery.
export default function ExamineObjectCard({
  object,
  exhibitionSlug,
}: {
  object: ObjectConfig;
  exhibitionSlug: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#070b08] px-5 py-24 text-ivory md:px-10 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(22,63,50,0.6),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[14%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-ochre/50 to-transparent md:block"
      />

      <div className="relative mx-auto max-w-7xl">
        <p className="font-sans text-label font-medium uppercase tracking-[0.22em] text-ochre">
          Examine the object
        </p>

        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em]">
          {object.title}
        </h2>

        <p className="mt-6 max-w-xl font-sans text-body-l text-ivory/70">
          {object.teaser}
        </p>

        <Link
          to={`/experiences/${exhibitionSlug}/object/${object.key}`}
          className="mt-12 inline-flex h-14 items-center gap-5 border border-ivory/40 px-8 font-sans text-body-s uppercase tracking-[0.16em] transition-colors hover:border-ochre hover:bg-ochre/10"
        >
          Enter the gallery
          <span aria-hidden className="text-ochre">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
