interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div>
      <label htmlFor="search-input" className="sr-only">
        Search people, places, events, objects and stories
      </label>

      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search REKÒ"
        autoComplete="off"
        autoFocus
        className="w-full border-b border-ink/40 bg-transparent pb-4 font-display text-display-m leading-none outline-none transition-colors placeholder:text-ink/25 focus:border-heritage-green"
      />
    </div>
  );
}

export default SearchInput;
