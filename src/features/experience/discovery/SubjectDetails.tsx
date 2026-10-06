import { formatYear } from "../../../lib/dates";
import { toParagraphs } from "../../../lib/text";
import SourceList from "../components/SourceList";
import type {
  DiscoverySubject,
  ExperienceMedia,
  ExperiencePerson,
  ExperiencePlace,
  ExperienceSource,
} from "../types";
import type { LoadStatus } from "../useCachedList";
import {
  usePersonMedia,
  usePersonSources,
  usePlaceMedia,
  usePlaceSources,
} from "../useConnections";

// "1933–1999", "Born 1933", "Died 1999", or nothing if no dates are known.
function lifeSpan(person: ExperiencePerson) {
  const born = person.birth_date ? formatYear(person.birth_date) : null;
  const died = person.death_date ? formatYear(person.death_date) : null;

  if (born && died) return `${born}–${died}`;
  if (born) return `Born ${born}`;
  if (died) return `Died ${died}`;
  return null;
}

// The first picture attached to a person or place, with its credit.
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
      ? `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=12/${place.latitude}/${place.longitude}`
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
          rel="noreferrer"
          className="mt-8 inline-block border-b border-ink font-sans text-body-m font-medium"
        >
          See on a map
        </a>
      )}

      <SourcesBlock sources={sources} status={status} />
    </article>
  );
}

// What the drawer shows: a person or a place.
function SubjectDetails({ subject }: { subject: DiscoverySubject }) {
  return subject.kind === "person" ? (
    <PersonDetails person={subject.person} />
  ) : (
    <PlaceDetails place={subject.place} />
  );
}

export default SubjectDetails;
