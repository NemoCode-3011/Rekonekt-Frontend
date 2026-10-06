import { useSectionSources } from "../useConnections";
import SourceList from "./SourceList";

// The sources behind one chapter. Shows nothing if none are linked yet.
function ChapterSources({ sectionId }: { sectionId: number }) {
  const { items: sources, status } = useSectionSources(sectionId);

  if (status === "error") {
    return (
      <section className="border-t border-line bg-ivory text-ink">
        <p className="mx-auto max-w-7xl px-5 py-12 font-sans text-body-s text-muted md:px-10">
          We couldn't load this chapter's sources. Refresh to try again.
        </p>
      </section>
    );
  }

  if (sources.length === 0) return null;

  return (
    <section
      aria-labelledby="chapter-sources-heading"
      className="border-t border-line bg-ivory text-ink"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <h2 id="chapter-sources-heading" className="text-heading-m">
            Sources
          </h2>
          <p className="mt-4 max-w-xs font-sans text-body-m text-muted">
            Where this chapter's account comes from. Where a source has a point
            of view, we note it.
          </p>
        </div>

        <div className="md:col-span-8">
          <SourceList sources={sources} />
        </div>
      </div>
    </section>
  );
}

export default ChapterSources;
