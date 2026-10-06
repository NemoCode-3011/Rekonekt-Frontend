import type { ReactNode } from "react";
import { toParagraphs } from "../../../lib/text";
import type { ExperienceSection } from "../types";
import { useSectionArtifacts } from "../useSectionArtifacts";
import { useSectionEvents } from "../useSectionEvent";
import ArtifactGallery from "./ArtifactGallery";
import ChapterConnections from "./ChapterConnections";
import ChapterSources from "./ChapterSources";
import EventMoment from "./EventMoment";

interface ChapterContentProps {
  section: ExperienceSection;
  date: string;
}

// A short status line shown while something loads or when it fails.
function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-16 font-sans text-body-s text-muted md:mt-24">
      {children}
    </p>
  );
}

// Everything below a chapter's cinematic opening, top to bottom:
//   1. the story and its dated moments   (ivory)
//   2. objects                           (dark room)
//   3. people and places                 (ivory)
//   4. sources                           (ivory)
// The moments and objects are loaded here. People, places and sources are
// loaded by their own components, which hide themselves when empty.
function ChapterContent({ section, date }: ChapterContentProps) {
  const { items: events, status: eventsStatus } = useSectionEvents(section.id);
  const { items: artifacts, status: artifactsStatus } = useSectionArtifacts(
    section.id,
  );

  return (
    <>
      <section className="bg-ivory text-ink">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
          <div className="grid gap-16 md:grid-cols-[1fr_2fr] md:gap-24">
            <div>
              <p className="font-sans text-label uppercase tracking-[0.18em] text-muted">
                The story
              </p>

              <p className="mt-5 font-display text-heading-s text-ochre">
                {date}
              </p>

              <div className="mt-6 h-px w-16 bg-ochre" />
            </div>

            <div>
              {toParagraphs(section.introduction).map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "max-w-[44rem] font-display text-heading-m leading-[1.25] text-ink"
                      : "mt-6 max-w-[44rem] font-sans text-body-m leading-[1.8] text-ink/80"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {eventsStatus === "loading" && (
            <Notice>Loading this chapter's moments…</Notice>
          )}
          {eventsStatus === "error" && (
            <Notice>
              We couldn't load this chapter's moments. Refresh to try again.
            </Notice>
          )}
          {artifactsStatus === "error" && (
            <Notice>
              We couldn't load this chapter's objects. Refresh to try again.
            </Notice>
          )}

          {eventsStatus === "ready" && events.length > 0 && (
            <div className="mt-24 md:mt-32">
              {events.map((event) => (
                <EventMoment key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ArtifactGallery artifacts={artifacts} />
      <ChapterConnections sectionId={section.id} />
      <ChapterSources sectionId={section.id} />
    </>
  );
}

export default ChapterContent;