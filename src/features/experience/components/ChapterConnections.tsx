import { toParagraphs } from "../../../lib/text";
import { useDiscovery } from "../discovery/discovery-context";
import { useSectionPeople, useSectionPlaces } from "../useConnections";

interface ConnectionRowProps {
  name: string;
  summary: string | undefined;
  onOpen: () => void;
}

// One person or place. Selecting it opens the side drawer.
function ConnectionRow({ name, summary, onOpen }: ConnectionRowProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-baseline justify-between gap-6 border-t border-line py-5 text-left"
    >
      <span>
        <span className="block font-display text-heading-s leading-tight transition-colors group-hover:text-heritage-green">
          {name}
        </span>
        {summary && (
          <span className="mt-1 line-clamp-2 block font-sans text-body-s text-muted">
            {summary}
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        className="shrink-0 text-ink/40 transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}

// The people and places that belong to a chapter.
function ChapterConnections({ sectionId }: { sectionId: number }) {
  const { open } = useDiscovery();
  const people = useSectionPeople(sectionId);
  const places = useSectionPlaces(sectionId);

  const failed = people.status === "error" || places.status === "error";
  const isEmpty = people.items.length === 0 && places.items.length === 0;

  if (isEmpty && !failed) return null;

  return (
    <section
      aria-label="People and places in this chapter"
      className="border-t border-line bg-ivory text-ink"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <p className="mb-12 max-w-md font-sans text-body-m text-muted">
          Select a name to learn more. You won't lose your place.
        </p>

        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          {people.items.length > 0 && (
            <div>
              <h2 className="text-heading-m">People</h2>
              <ul className="mt-6 border-b border-line">
                {people.items.map((person) => (
                  <li key={person.id}>
                    <ConnectionRow
                      name={person.name}
                      summary={toParagraphs(person.description)[0]}
                      onOpen={() => open({ kind: "person", person })}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {places.items.length > 0 && (
            <div>
              <h2 className="text-heading-m">Places</h2>
              <ul className="mt-6 border-b border-line">
                {places.items.map((place) => (
                  <li key={place.id}>
                    <ConnectionRow
                      name={place.name}
                      summary={toParagraphs(place.description)[0]}
                      onOpen={() => open({ kind: "place", place })}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {failed && (
          <p className="mt-12 font-sans text-body-s text-muted">
            Some people or places couldn't be loaded. Refresh to try again.
          </p>
        )}
      </div>
    </section>
  );
}

export default ChapterConnections;
