import { Link } from "react-router-dom";
import { useDiscovery } from "../../experience/discovery/discovery-context";
import type { DiscoveryRef } from "../../experience/discovery/types";
import type { SearchResult } from "../types";

interface SearchResultGroupProps {
  label: string;
  results: SearchResult[];
}

// Exhibitions and hidden wonders have their own pages, so they are links.
function pathFor(result: SearchResult) {
  if (!result.slug) return null;
  if (result.type === "exhibition") {
    return `/exhibitions/${encodeURIComponent(result.slug)}`;
  }
  if (result.type === "wonder") {
    return `/wonders/${encodeURIComponent(result.slug)}`;
  }
  return null;
}

// What opens in the drawer when a result is selected. Pages that have their
// own address return null here and are handled as links below.
function refFor(result: SearchResult): DiscoveryRef | null {
  switch (result.type) {
    case "person":
    case "artifact":
    case "story":
      return result.slug ? { kind: result.type, slug: result.slug } : null;
    case "event":
    case "place":
      return { kind: result.type, id: result.id };
    default:
      return null;
  }
}

const rowClass =
  "group flex w-full items-baseline justify-between gap-6 border-t border-line py-5 text-left";

function RowText({ result }: { result: SearchResult }) {
  return (
    <>
      <span>
        <span className="block font-display text-heading-s leading-tight transition-colors group-hover:text-heritage-green">
          {result.title}
        </span>
        {result.summary && (
          <span className="mt-1 line-clamp-2 block font-sans text-body-s text-muted">
            {result.summary}
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        className="shrink-0 text-ink/40 transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );
}

function SearchResultGroup({ label, results }: SearchResultGroupProps) {
  const { openRef } = useDiscovery();

  return (
    <section>
      <h2 className="font-display text-heading-m">
        {label}
        <span className="ml-3 font-sans text-body-s text-muted">
          {results.length}
        </span>
      </h2>

      <ul className="mt-4 border-b border-line">
        {results.map((result) => {
          const key = `${result.type}-${result.id}`;
          const ref = refFor(result);
          const path = pathFor(result);

          if (path) {
            return (
              <li key={key}>
                <Link to={path} className={rowClass}>
                  <RowText result={result} />
                </Link>
              </li>
            );
          }

          if (ref) {
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => openRef(ref)}
                  className={rowClass}
                >
                  <RowText result={result} />
                </button>
              </li>
            );
          }

          return null;
        })}
      </ul>
    </section>
  );
}

export default SearchResultGroup;