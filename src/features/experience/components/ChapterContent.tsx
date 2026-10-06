import type { ExperienceSection } from "../types";
import { useSectionEvents } from "../useSectionEvent";
import EventMoment from "./EventMoment";

interface ChapterContentProps {
  section: ExperienceSection;
  chapterNumber: number;
  date: string;
}

function ChapterContent({ section, chapterNumber, date }: ChapterContentProps) {
  const { events, status } = useSectionEvents(section.id);

  return (
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
            {section.introduction?.split(/\n+/).map((paragraph, index) => (
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

        {status === "loading" && (
          <p className="mt-24 font-sans text-body-s text-muted md:mt-32">
            Loading this chapter's moments…
          </p>
        )}

        {status === "error" && (
          <p className="mt-24 font-sans text-body-s text-muted md:mt-32">
            We couldn't load this chapter's moments. Refresh to try again.
          </p>
        )}

        {status === "ready" && events.length > 0 && (
          <div className="mt-24 md:mt-32">
            {events.map((event) => (
              <EventMoment key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-20 border-t border-line pt-6">
          <p className="font-sans text-meta uppercase tracking-[0.14em] text-muted">
            Chapter {String(chapterNumber).padStart(2, "0")} · The Aburi Accord
          </p>
        </div>
      </div>
    </section>
  );
}

export default ChapterContent;
