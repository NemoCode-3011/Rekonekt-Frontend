import type { ExperienceEvent } from "../types";
import ImageReveal from "./ImageReveal";

interface EventMomentProps {
  event: ExperienceEvent;
}

function anchorLabel(event: ExperienceEvent) {
  if (event.date_display) return event.date_display;
  if (event.event_date) return event.event_date.slice(0, 4);
  return null;
}

function EventMoment({ event }: EventMomentProps) {
  const label = anchorLabel(event);
  const paragraphs = event.description?.split(/\n+/).filter(Boolean) ?? [];

  return (
    <article className="border-t border-line py-14 md:py-20">
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] md:gap-16">
        <div>
          {label && (
            <p className="font-display text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[0.95] tracking-[-0.04em] text-ochre md:sticky md:top-28">
              {label}
            </p>
          )}
        </div>

        <div>
          <h3 className="max-w-[36rem] font-display text-heading-m leading-[1.15]">
            {event.title}
          </h3>

          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="mt-5 max-w-176 font-sans text-body-m leading-[1.8] text-ink/80"
            >
              {paragraph}
            </p>
          ))}

          {event.image_url && (
            <figure className="mt-10 max-w-3xl">
              <ImageReveal src={event.image_url} alt={event.title} />
            </figure>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventMoment;