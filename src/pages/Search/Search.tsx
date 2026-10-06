import { useSearchParams } from "react-router-dom";
import SearchInput from "../../features/search/components/SearchInput";
import SearchResults from "../../features/search/components/SearchResults";
import { useSearch } from "../../features/search/hooks/useSearch";

function Search() {
  // The search text lives in the address bar (?q=...), so a search can be
  // shared, and the back button behaves as expected.
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";

  const { status, results, searching } = useSearch(query);

  return (
    <div className="bg-ivory text-ink">
      <div className="container py-12 md:py-20">
        <h1 className="sr-only">Search REKÒ</h1>

        <SearchInput
          value={query}
          onChange={(value) =>
            setParams(value ? { q: value } : {}, { replace: true })
          }
        />

        <div className="mt-12 md:mt-16">
          <SearchResults
            query={query}
            status={status}
            searching={searching}
            results={results}
          />
        </div>
      </div>
    </div>
  );
}

export default Search;
