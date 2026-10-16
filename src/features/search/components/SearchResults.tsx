import type { SearchStatus } from "../hooks/useSearch";
import type { SearchResult, SearchResultType } from "../types";
import SearchResultGroup from "./SearchResultGroup";

// The order groups appear in.
const groups: { type: SearchResultType; label: string }[] = [
  { type: "exhibition", label: "Exhibitions" },
  { type: "person", label: "People" },
  { type: "event", label: "Events" },
  { type: "place", label: "Places" },
  { type: "artifact", label: "Objects" },
  { type: "story", label: "Stories" },
];

interface SearchResultsProps {
  query: string;
  status: SearchStatus;
  searching: boolean;
  results: SearchResult[];
}

function SearchResults({
  query,
  status,
  searching,
  results,
}: SearchResultsProps) {
  // aria-live makes screen readers announce changes as results arrive.
  return (
    <div aria-live="polite">
      {status === "idle" && (
        <p className="max-w-md font-sans text-body-l text-muted">
          Search for people, places, events, objects and stories.
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="font-sans text-body-m text-muted">
          Search isn't working right now. Please try again in a moment.
        </p>
      )}

      {status === "ready" && results.length === 0 && (
        <p className="font-sans text-body-m text-muted">
          {searching
            ? "Searching…"
            : `No results for “${query.trim()}”. Try a shorter word or a different spelling.`}
        </p>
      )}

      {status === "ready" && results.length > 0 && (
        <div
          className={`space-y-14 transition-opacity ${
            searching ? "opacity-50" : "opacity-100"
          }`}
        >
          {groups.map(({ type, label }) => {
            const inGroup = results.filter((result) => result.type === type);
            if (inGroup.length === 0) return null;

            return (
              <SearchResultGroup key={type} label={label} results={inGroup} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchResults;