import { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { getApiErrorMessage, http } from "../../../services/api/client";
import { useAuth } from "../../auth/auth-context";
import { addSourceFor } from "../api/workspace";
import InlineForm, { type FormField } from "./InlineForm";

type Owner = "person" | "place" | "event" | "artifact";

interface SourceLink {
  id: number;
  source_id: number;
  person_id: number | null;
  place_id: number | null;
  event_id: number | null;
  artifact_id: number | null;
}

interface Source {
  id: number;
  title: string;
  url: string | null;
  source_type: string | null;
}

interface Linked {
  linkId: number;
  title: string;
  url: string | null;
  type: string | null;
}

const fields: FormField[] = [
  { name: "title", label: "Title", required: true },
  {
    name: "sourceType",
    label: "Type",
    kind: "select",
    initial: "Website",
    options: [
      "Book",
      "Article",
      "Website",
      "Archive document",
      "Museum page",
      "Other",
    ].map((value) => ({ value, label: value })),
  },
  { name: "publication", label: "Publication or publisher" },
  { name: "url", label: "Link" },
];

async function get<T>(path: string) {
  return (await http.get<{ data: T }>(path)).data.data;
}

// The public sources endpoint hides drafts, so admins read the full lists.
async function loadSources(owner: Owner, id: number): Promise<Linked[]> {
  const [links, sources] = await Promise.all([
    get<SourceLink[]>("/source-links"),
    get<Source[]>("/sources"),
  ]);
  const key = `${owner}_id` as const;

  return links
    .filter((link) => link[key] === id)
    .flatMap((link) => {
      const source = sources.find((item) => item.id === link.source_id);
      if (!source) return [];

      return [
        {
          linkId: link.id,
          title: source.title,
          url: source.url,
          type: source.source_type,
        },
      ];
    });
}

export default function AdminSources({
  owner,
  id,
}: {
  owner: Owner;
  id: number;
}) {
  const { showToast } = useAuth();
  const [sources, setSources] = useState<Linked[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState(
    "We couldn’t load the sources. You can still add one below.",
  );
  const [reload, setReload] = useState(0);
  const [removing, setRemoving] = useState<Linked | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadSources(owner, id)
      .then((result) => {
        if (cancelled) return;
        setSources(result);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(
              error,
              "We couldn’t load the sources. You can still add one below.",
            ),
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, id, reload]);

  async function addSource(values: Record<string, string>) {
    await addSourceFor({ [`${owner}Id`]: id }, values);
    showToast("Source added.");
    setReload((count) => count + 1);
  }

  async function removeSource() {
    if (!removing) return;
    setBusy(true);

    try {
      await http.delete(`/source-links/${removing.linkId}`);
      showToast("Source removed.");
      setReload((count) => count + 1);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not remove the source.",
        "error",
      );
    } finally {
      setBusy(false);
      setRemoving(null);
    }
  }

  return (
    <section className="border border-line p-5">
      <h2 className="font-display text-heading-s">Sources</h2>

      {status === "loading" && (
        <p role="status" className="mt-3 font-sans text-body-s text-muted">
          Loading sources…
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="mt-3 font-sans text-body-s text-error">
          {loadError}
        </p>
      )}

      {status === "ready" && sources.length === 0 && (
        <p className="mt-3 font-sans text-body-s text-muted">
          No sources yet.
        </p>
      )}

      {sources.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {sources.map((source) => (
            <li key={source.linkId} className="py-3">
              <p className="font-sans text-body-s text-ink">{source.title}</p>
              {source.type && (
                <p className="font-sans text-meta text-muted">{source.type}</p>
              )}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-sans text-meta underline underline-offset-4"
                >
                  {source.url}
                </a>
              )}
              <button
                type="button"
                onClick={() => setRemoving(source)}
                className="mt-2 font-sans text-meta text-error underline underline-offset-4"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-6 font-sans text-label font-medium uppercase tracking-widest text-muted">
        Add a source
      </h3>
      <div className="mt-3">
        <InlineForm
          submitLabel="Add source"
          fields={fields}
          onSubmit={addSource}
        />
      </div>

      {removing && (
        <ConfirmDialog
          title="Remove this source?"
          message="It will no longer be listed here or on the site."
          confirmLabel="Remove source"
          danger
          busy={busy}
          onConfirm={removeSource}
          onCancel={() => setRemoving(null)}
        />
      )}
    </section>
  );
}