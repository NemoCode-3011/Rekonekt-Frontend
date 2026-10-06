import { formatYear } from "../../../lib/dates";
import { toParagraphs } from "../../../lib/text";
import SourceList from "../components/SourceList";
import type {
  ExperienceArtifact,
  ExperienceEvent,
  ExperienceMedia,
  ExperiencePerson,
  ExperiencePlace,
  ExperienceSource,
} from "../types";
import type { LoadStatus } from "../useCachedList";
import {
  useArtifactMedia,
  useArtifactSources,
  useEventSources,
  usePersonMedia,
  usePersonSources,
  usePlaceMedia,
  usePlaceSources,
} from "../useConnections";
import type { DiscoverySubject, ExperienceStory } from "./types";
import SaveButton from "../../bookmarks/components/SaveButton";

// "1933–1999", "Born 1933", "Died 1999", or nothing if no dates are known.
function lifeSpan(person: ExperiencePerson) {
  const born = person.birth_date ? formatYear(person.birth_date) : null;
  const died = person.death_date ? formatYear(person.death_date) : null;

  if (born && died) return `${born}–${died}`;
  if (born) return `Born ${born}`;
  if (died) return `Died ${died}`;
  return null;
}

// ---------- Small pieces shared by every kind of subject ----------

// The first picture attached to the subject, with its credit.
function Picture({
  media,
  alt,
  shape,
}: {
  media: ExperienceMedia[];
  alt: string;
  shape: string;
}) {
  const image = media.find((item) => item.media_type === "image");
  if (!image) return null;

  return (
    <figure className="mb-8">
      <img
        src={image.file_url}
        alt={alt}
        className={`w-full object-cover object-top ${shape}`}
      />
      {image.source_credit && (
        <figcaption className="mt-2 font-sans text-label text-muted">
          Credit: {image.source_credit}
        </figcaption>
      )}
    </figure>
  );
}

// Files that aren't pictures (PDFs, audio, video) as simple links.
function OtherFiles({ media }: { media: ExperienceMedia[] }) {
  const files = media.filter((item) => item.media_type !== "image");
  if (files.length === 0) return null;

  return (
    <ul className="mt-8 space-y-2">
      {files.map((file) => (
        <li key={file.id}>
          <a
            href={file.file_url}
            target="_blank"
            rel="noreferrer"
            className="border-b border-ink font-sans text-body-m font-medium"
          >
            Open {file.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Description({ text }: { text: string | null }) {
  return (
    <>
      {toParagraphs(text).map((paragraph, index) => (
        <p
          key={index}
          className="mt-5 font-sans text-body-m leading-[1.75] text-ink/80"
        >
          {paragraph}
        </p>
      ))}
    </>
  );
}

function SourcesBlock({
  sources,
  status,
}: {
  sources: ExperienceSource[];
  status: LoadStatus;
}) {
  if (status === "error") {
    return (
      <p className="mt-12 font-sans text-body-s text-muted">
        We couldn't load the sources. Close this panel and try again.
      </p>
    );
  }

  if (sources.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="text-heading-s">Sources</h3>
      <div className="mt-4">
        <SourceList sources={sources} />
      </div>
    </section>
  );
}

// ---------- One layout per kind of subject ----------

function PersonDetails({ person }: { person: ExperiencePerson }) {
  const { items: media } = usePersonMedia(person.id);
  const { items: sources, status } = usePersonSources(person.id);
  const years = lifeSpan(person);

  return (
    <article>
      <Picture media={media} alt={person.name} shape="aspect-[4/5]" />

      {years && (
        <p className="font-display text-heading-s text-ochre">{years}</p>
      )}
      <h2 className="mt-2 text-heading-l leading-[1.05]">{person.name}</h2>
      <Description text={person.description} />

      <SourcesBlock sources={sources} status={status} />
    </article>
  );
}

function PlaceDetails({ place }: { place: ExperiencePlace }) {
  const { items: media } = usePlaceMedia(place.id);
  const { items: sources, status } = usePlaceSources(place.id);

  const mapUrl =
    place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`
      : null;

  return (
    <article>
      <Picture media={media} alt={place.name} shape="aspect-[4/3]" />

      <h2 className="text-heading-l leading-[1.05]">{place.name}</h2>
      <Description text={place.description} />

      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block border-b border-ink font-sans text-body-m font-medium"
        >
          See on a map
        </a>
      )}

      <SourcesBlock sources={sources} status={status} />
    </article>
  );
}

function EventDetails({ event }: { event: ExperienceEvent }) {
  const { items: sources, status } = useEventSources(event.id);

  return (
    <article>
      {event.date_display && (
        <p className="font-display text-heading-m leading-none tracking-[-0.03em] text-ochre">
          {event.date_display}
        </p>
      )}
      <h2 className="mt-3 text-heading-l leading-[1.05]">{event.title}</h2>

      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="mt-8 w-full" />
      )}

      <Description text={event.description} />
      <SourcesBlock sources={sources} status={status} />
    </article>
  );
}

function ArtifactDetails({ artifact }: { artifact: ExperienceArtifact }) {
  const { items: media } = useArtifactMedia(artifact.id);
  const { items: sources, status } = useArtifactSources(artifact.id);
  const context = toParagraphs(artifact.historical_context);

  return (
    <article>
      <Picture media={media} alt={artifact.title} shape="" />

      {artifact.date_display && (
        <p className="font-display text-heading-s text-ochre">
          {artifact.date_display}
        </p>
      )}
      <h2 className="mt-2 text-heading-l leading-[1.05]">{artifact.title}</h2>
      {artifact.artifact_type && (
        <p className="mt-2 font-sans text-body-s text-muted">
          {artifact.artifact_type}
        </p>
      )}

      <div className="mt-5">
        <SaveButton artifactId={artifact.id} tone="light" />
      </div>

      <Description text={artifact.description} />

      {context.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-sans text-body-s font-medium">
            Historical context
          </h3>
          {context.map((paragraph, index) => (
            <p
              key={index}
              className="mt-3 font-sans text-body-m leading-[1.75] text-ink/80"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <OtherFiles media={media} />
      <SourcesBlock sources={sources} status={status} />
    </article>
  );
}

function StoryDetails({ story }: { story: ExperienceStory }) {
  return (
    <article>
      {story.cover_image_url && (
        <img
          src={story.cover_image_url}
          alt={story.title}
          className="mb-8 w-full"
        />
      )}

      <h2 className="text-heading-l leading-[1.05]">{story.title}</h2>
      {story.excerpt && (
        <p className="mt-5 font-display text-heading-s leading-snug text-ink/80">
          {story.excerpt}
        </p>
      )}
      <Description text={story.content} />
    </article>
  );
}

// What the drawer shows, depending on what was selected.
function SubjectDetails({ subject }: { subject: DiscoverySubject }) {
  switch (subject.kind) {
    case "person":
      return <PersonDetails person={subject.person} />;
    case "place":
      return <PlaceDetails place={subject.place} />;
    case "event":
      return <EventDetails event={subject.event} />;
    case "artifact":
      return <ArtifactDetails artifact={subject.artifact} />;
    case "story":
      return <StoryDetails story={subject.story} />;
  }
}

export default SubjectDetails;