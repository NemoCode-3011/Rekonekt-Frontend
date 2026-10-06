import type { ExperienceSource } from "../types";

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

// A list of sources. Because this is contested history, a source's
// "perspective note" (the point of view it comes from) is shown clearly.
function SourceList({ sources }: { sources: ExperienceSource[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {sources.map((source) => {
        const details = describe(source);

        return (
          <li key={source.id} className="py-6">
            <p className="font-display text-heading-s leading-snug">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-ochre underline-offset-4 hover:text-heritage-green"
                >
                  {source.title}
                </a>
              ) : (
                source.title
              )}
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

export default SourceList;
