import { useBookCover } from "../useBookCover";
import type { ExperienceSource } from "../types";

// Books, papers and online catalogues go under "Further reading".
// Everything else is a cited source.
const READING_TYPES = ["book", "paper", "database"];

const isReading = (source: ExperienceSource) =>
  READING_TYPES.includes(source.source_type ?? "");

// "Author, Publication, 1967", leaving out whatever is missing.
function describe(source: ExperienceSource) {
  return [
    source.author,
    source.publication,
    source.publication_date?.slice(0, 4),
  ]
    .filter(Boolean)
    .join(", ");
}

function TitleLink({ source }: { source: ExperienceSource }) {
  if (!source.url) return <>{source.title}</>;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-ochre underline-offset-4 hover:text-heritage-green"
    >
      {source.title}
    </a>
  );
}

// A book cover. Shows a plain tile when there is no cover or it fails to load.
function CoverTile({ source }: { source: ExperienceSource }) {
  return (
    <div className="flex aspect-2/3 w-24 shrink-0 flex-col justify-between bg-heritage-green p-3 text-ivory sm:w-28">
      <span className="font-sans text-label uppercase tracking-[0.15em] text-ochre">
        {source.source_type}
      </span>
      <span className="line-clamp-5 font-display text-body-s leading-tight">
        {source.title}
      </span>
      <span className="line-clamp-2 font-sans text-label text-ivory/70">
        {source.author}
      </span>
    </div>
  );
}

function Cover({ source }: { source: ExperienceSource }) {
  const { src, onError, onLoad } = useBookCover(source);

  if (!src) return <CoverTile source={source} />;

  return (
    <img
      src={src}
      alt={`Cover of ${source.title}`}
      loading="lazy"
      onError={onError}
      onLoad={onLoad}
      className="aspect-2/3 w-24 shrink-0 bg-sand/40 object-cover shadow-md sm:w-28"
    />
  );
}

function ReadingList({ sources }: { sources: ExperienceSource[] }) {
  return (
    <div className="@container mb-12">
      <h3 className="font-display text-heading-s">Further reading</h3>

      <ul className="mt-6 grid gap-5 @2xl:grid-cols-2">
        {sources.map((source) => {
          const details = describe(source);

          return (
            <li
              key={source.id}
              className="flex gap-5 border border-line bg-sand/20 p-5 sm:gap-6 sm:p-6"
            >
              <Cover source={source} />

              <div className="min-w-0 break-words">
                <p className="font-display text-heading-s leading-snug">
                  <TitleLink source={source} />
                </p>

                {details && (
                  <p className="mt-2 font-sans text-body-s text-muted">
                    {details}
                  </p>
                )}

                {source.perspective_note && (
                  <p className="mt-3 font-sans text-body-s leading-relaxed text-ink/80">
                    {source.perspective_note}
                  </p>
                )}

                {source.rights_statement && (
                  <p className="mt-3 font-sans text-label text-muted">
                    {source.rights_statement}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// The sources behind the content. Because this is contested history, a
// source's "perspective note" (the point of view it comes from) is shown clearly.
function CitedList({ sources }: { sources: ExperienceSource[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {sources.map((source) => {
        const details = describe(source);

        return (
          <li key={source.id} className="py-6">
            <p className="font-display text-heading-s leading-snug">
              <TitleLink source={source} />
            </p>

            {details && (
              <p className="mt-1 font-sans text-body-s text-muted">{details}</p>
            )}

            {source.citation && (
              <p className="mt-3 font-sans text-body-s leading-relaxed text-ink/80">
                {source.citation}
              </p>
            )}

            {source.perspective_note && (
              <div className="mt-4 border-l-2 border-ochre pl-4">
                <p className="font-sans text-body-s font-medium">
                  Perspective note
                </p>
                <p className="mt-1 font-sans text-body-s leading-relaxed text-ink/80">
                  {source.perspective_note}
                </p>
              </div>
            )}

            {source.rights_statement && (
              <p className="mt-3 font-sans text-label text-muted">
                {source.rights_statement}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SourceList({ sources }: { sources: ExperienceSource[] }) {
  const reading = sources.filter(isReading);
  const cited = sources.filter((source) => !isReading(source));

  return (
    <>
      {reading.length > 0 && <ReadingList sources={reading} />}
      {cited.length > 0 && <CitedList sources={cited} />}
    </>
  );
}

export default SourceList;
