import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createAdminWonder,
  listAdminWonders,
  type AdminWonder,
} from "../../features/admin/api/wonders";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import { newWonderFields } from "../../features/admin/components/WonderFields";
import {
  WONDER_TYPES,
  isWonderType,
  wonderTypeLabel,
} from "../../features/wonders/types";
import PageLoader from "../../components/ui/PageLoader";
import PageError from "../../components/ui/PageError";
import { getApiErrorMessage } from "../../services/api/client";

type StatusFilter = "all" | "published" | "draft";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export default function AdminWonders() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<AdminWonder[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("We couldn't load the wonders.");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const creating = params.get("new") === "1";

  useEffect(() => {
    let cancelled = false;

    listAdminWonders()
      .then((wonders) => {
        if (cancelled) return;
        setItems(wonders);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, "We couldn't load the wonders."));
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function setCreating(open: boolean) {
    setParams(open ? { new: "1" } : {}, { replace: true });
  }

  const visible = items.filter(
    (item) =>
      (!typeFilter || item.wonder_type === typeFilter) &&
      (statusFilter === "all" ||
        (statusFilter === "published"
          ? item.status === "published"
          : item.status !== "published")),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title="Hidden wonders"
        description="Anything worth discovering: a place, a festival, a food, a craft, a tradition. Each one gets its own page, with a story, pictures and links to learn more."
        action={
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
            >
              New wonder
            </button>
          )
        }
      />

      {creating && (
        <div className="mt-8 max-w-2xl">
          <InlineForm
            submitLabel="Create and open"
            onCancel={() => setCreating(false)}
            fields={newWonderFields()}
            onSubmit={async (values) => {
              const created = await createAdminWonder(values);
              navigate(`/admin/wonders/${created.id}`);
            }}
          />
          <p className="mt-3 font-sans text-meta text-muted">
            It is saved as a draft. You can add the story, pictures, map pin
            and links on the next page.
          </p>
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2" role="group" aria-label="Filter by status">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                aria-pressed={statusFilter === filter.value}
                className={`h-9 border px-4 font-sans text-body-s transition-colors ${
                  statusFilter === filter.value
                    ? "border-heritage-green bg-heritage-green text-ivory"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 font-sans text-body-s text-muted">
            Type
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="border border-line bg-transparent px-3 py-2 font-sans text-body-s text-ink"
            >
              <option value="">All types</option>
              {WONDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {wonderTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="py-8">
        {status === "loading" && <PageLoader label="Loading wonders…" />}

        {status === "error" && (
          <PageError
            message={loadError}
            backTo="/admin"
            backLabel="Back to dashboard"
          />
        )}

        {status === "ready" && items.length === 0 && (
          <p className="font-sans text-body-m text-muted">
            No wonders yet. Create the first one above.
          </p>
        )}

        {status === "ready" && items.length > 0 && visible.length === 0 && (
          <p className="font-sans text-body-m text-muted">
            Nothing matches these filters.
          </p>
        )}

        {status === "ready" && visible.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((item) => {
              const type = isWonderType(item.wonder_type)
                ? wonderTypeLabel(item.wonder_type)
                : null;

              return (
                <li key={item.id}>
                  <Link
                    to={`/admin/wonders/${item.id}`}
                    className="flex items-center justify-between gap-4 py-5 transition-colors hover:bg-heritage-green/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-heading-s">
                        {item.title}
                      </p>
                      <p className="truncate font-sans text-body-s text-muted">
                        {[type, item.region].filter(Boolean).join(" · ") ||
                          "No details yet"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-0.5 font-sans text-meta capitalize ${
                        item.status === "published"
                          ? "border-heritage-green/40 text-heritage-green"
                          : "border-line text-muted"
                      }`}
                    >
                      {item.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}