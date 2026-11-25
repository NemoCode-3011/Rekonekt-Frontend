interface Row {
  label: string;
  url: string;
  note: string;
}

interface LinksFieldProps {
  id: string;
  label: string;
  value: string; // the rows
  onChange: (value: string) => void;
  invalid?: boolean;
}

const MAX_LINKS = 20;

const inputClass =
  "w-full border border-line bg-ivory px-3 py-2 font-sans text-body-s transition-colors focus:border-heritage-green";

const actionClass =
  "font-sans text-meta text-muted underline underline-offset-4 hover:text-ink disabled:no-underline disabled:opacity-40";

function read(value: string): Row[] {
  try {
    const rows: unknown = JSON.parse(value || "[]");

    return Array.isArray(rows)
      ? (rows as Record<string, unknown>[]).map((row) => ({
          label: String(row?.label ?? ""),
          url: String(row?.url ?? ""),
          note: String(row?.note ?? ""),
        }))
      : [];
  } catch {
    return [];
  }
}

// A short list where each row is a name, a web address and an optional note.
// Used for "Learn more": places on the web where people can find out more.
export default function LinksField({
  id,
  label,
  value,
  onChange,
  invalid,
}: LinksFieldProps) {
  const rows = read(value);

  const save = (next: Row[]) => onChange(JSON.stringify(next));

  const edit = (index: number, field: keyof Row, text: string) =>
    save(
      rows.map((row, position) =>
        position === index ? { ...row, [field]: text } : row,
      ),
    );

  const move = (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    save(next);
  };

  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      data-invalid={invalid ? "true" : "false"}
      className="space-y-3"
    >
      {rows.length === 0 && (
        <p className="font-sans text-body-s text-muted">
          No links yet. Add a website where visitors can find out more.
        </p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="space-y-2 border border-line bg-ivory/60 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              type="text"
              value={row.label}
              placeholder="Name, e.g. Official website"
              aria-label={`Link ${index + 1} name`}
              className={inputClass}
              onChange={(event) => edit(index, "label", event.target.value)}
            />
            <input
              type="text"
              inputMode="url"
              value={row.url}
              placeholder="Web address, e.g. obuduranch.com"
              aria-label={`Link ${index + 1} web address`}
              className={inputClass}
              onChange={(event) => edit(index, "url", event.target.value)}
            />
          </div>

          <input
            type="text"
            value={row.note}
            placeholder="Short note (optional), e.g. Plan a visit and see prices"
            aria-label={`Link ${index + 1} note`}
            className={inputClass}
            onChange={(event) => edit(index, "note", event.target.value)}
          />

          <div className="flex gap-4">
            <button
              type="button"
              className={actionClass}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              Move up
            </button>
            <button
              type="button"
              className={actionClass}
              disabled={index === rows.length - 1}
              onClick={() => move(index, 1)}
            >
              Move down
            </button>
            <button
              type="button"
              className={actionClass}
              onClick={() => save(rows.filter((_, position) => position !== index))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={rows.length >= MAX_LINKS}
        onClick={() => save([...rows, { label: "", url: "", note: "" }])}
        className="h-10 border border-heritage-green px-4 font-sans text-body-s font-medium text-heritage-green transition-colors hover:bg-heritage-green/5 disabled:opacity-50"
      >
        Add a link
      </button>
    </div>
  );
}