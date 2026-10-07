import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import AdminQuickActions from "../../features/admin/components/AdminQuickActions";
import { useDashboardData } from "../../features/admin/hooks/useDashboardData";
import { useAuth } from "../../features/auth/auth-context";
import type {
  DashboardData,
  DashboardRecord,
} from "../../features/admin/types/dashboard";

const collections = [
  { key: "exhibitions", label: "Exhibitions" },
  { key: "events", label: "Events" },
  { key: "people", label: "People" },
  { key: "places", label: "Places" },
  { key: "artifacts", label: "Artifacts" },
  { key: "stories", label: "Stories" },
] as const;

function displayName(record: DashboardRecord) {
  return "title" in record ? record.title : record.name;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getRecentContent(data: DashboardData) {
  const records: DashboardRecord[] = [
    ...(data.exhibitionSummary?.recentlyUpdated.map((record) => ({
      ...record,
      kind: "Exhibition" as const,
    })) ?? []),
    ...(data.collections.events.items ?? []),
    ...(data.collections.people.items ?? []),
    ...(data.collections.places.items ?? []),
    ...(data.collections.artifacts.items ?? []),
    ...(data.collections.stories.items ?? []),
  ];

  return records
    .filter((record) => Boolean(record.updated_at))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime(),
    )
    .slice(0, 8);
}

export default function Dashboard() {
  const { user } = useAuth();
  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = useDashboardData();

  const recentContent = data ? getRecentContent(data) : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title={`Welcome, ${user?.name ?? "Admin"}.`}
        description="A working view of the stories, people, places, and records in REKÒ."
        action={
          <p className="font-sans text-label uppercase tracking-[0.16em] text-muted">
            {user?.role === "super admin" ? "Super admin" : "Admin"}
          </p>
        }
      />

      <section className="mt-10" aria-labelledby="content-overview-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
              The collection
            </p>
            <h2
              id="content-overview-heading"
              className="mt-2 font-display text-heading-m"
            >
              Content overview
            </h2>
          </div>
          {refreshing && (
            <p role="status" className="font-sans text-body-s text-muted">
              Updating…
            </p>
          )}
        </div>

        {loading && (
          <p
            role="status"
            className="mt-6 border-y border-line py-8 font-sans text-body-m text-muted"
          >
            Loading content records…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 border-y border-error/30 py-6"
          >
            <p className="font-sans text-body-m text-error">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-4 font-sans text-body-s font-medium text-ink underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {data && !error && (
          <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
            {collections.map(({ key, label }) => {
              const collection = data.collections[key];
              const records = collection.items;
              if (!records) {
                return (
                  <article
                    key={key}
                    className="flex min-h-48 flex-col justify-between bg-ivory p-5 md:p-7"
                  >
                    <div>
                      <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-muted">
                        {label}
                      </p>
                      <p className="mt-5 font-display text-heading-s">
                        Unavailable
                      </p>
                    </div>
                    <p className="mt-4 font-sans text-body-s text-error">
                      {collection.error}
                    </p>
                  </article>
                );
              }
              const published = records.filter(
                (record) => record.status === "published",
              ).length;
              const drafts = records.filter(
                (record) => record.status === "draft",
              ).length;
              const totalCount =
                key === "exhibitions"
                  ? data.exhibitionSummary?.totalCount
                  : records.length;
              const publishedCount =
                key === "exhibitions"
                  ? data.exhibitionSummary?.publishedCount
                  : published;
              const draftCount =
                key === "exhibitions"
                  ? data.exhibitionSummary?.draftCount
                  : drafts;
              return (
                <article
                  key={key}
                  className="flex min-h-48 flex-col justify-between bg-heritage-green/5 p-5 text-ink transition-colors md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-muted">
                      {label}
                    </p>
                  </div>
                  <p className="mt-5 font-display text-display-l leading-none tabular-nums text-deep-forest">
                    {totalCount}
                  </p>
                  <div className="mt-5 grid grid-cols-2 border-t border-line">
                    <div className="pt-3">
                      <p className="font-sans text-label uppercase tracking-[0.12em] text-muted">
                        Published
                      </p>
                      <p className="mt-1 font-display text-heading-s tabular-nums text-ink">
                        {publishedCount}
                      </p>
                    </div>
                    <div
                      className="border-l border-line pt-3 pl-4"
                    >
                      <p className="font-sans text-label uppercase tracking-[0.12em] text-muted">
                        Drafts
                      </p>
                      <p className="mt-1 font-display text-heading-s tabular-nums text-ink">
                        {draftCount}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="mt-14 bg-heritage-green/5 p-5 md:p-8"
        aria-labelledby="quick-actions-heading"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
            The workbench
          </p>
          <div className="sm:text-right">
            <h2
              id="quick-actions-heading"
              className="font-display text-heading-m"
            >
              Create content
            </h2>
            <p className="mt-1 font-sans text-body-s text-muted">
              Add to the living archive.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <AdminQuickActions
            exhibitions={data?.collections.exhibitions.items ?? null}
            sections={data?.sections ?? null}
            places={data?.collections.places.items ?? null}
            sectionsError={data?.sectionsError ?? null}
            onCreated={refresh}
          />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="recent-content-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
              The archive, in motion
            </p>
            <h2
              id="recent-content-heading"
              className="mt-2 font-display text-heading-m"
            >
              Recently updated
            </h2>
          </div>
          <p className="max-w-md font-sans text-body-s leading-relaxed text-muted">
            The latest changes across your collection.
          </p>
        </div>

        {loading && (
          <p role="status" className="py-8 font-sans text-body-s text-muted">
            Loading recent changes…
          </p>
        )}

        {data && !error && recentContent.length === 0 && (
          <p className="py-8 font-sans text-body-m text-muted">
            No update timestamps are available yet.
          </p>
        )}

        {data && !error && recentContent.length > 0 && (
          <ul className="mt-4 divide-y divide-line">
            {recentContent.map((record) => (
              <li
                key={`${record.kind}-${record.id}`}
                className="grid gap-3 bg-ivory/50 px-4 py-4 transition-colors even:bg-transparent hover:bg-heritage-green/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 md:px-5"
              >
                <div className="min-w-0">
                  <p className="font-sans text-label uppercase tracking-[0.14em] text-muted">
                    {record.kind}
                    {record.status && (
                      <span className="px-2 text-ochre">·</span>
                    )}
                    {record.status}
                  </p>
                  <p className="mt-1 truncate font-display text-heading-s">
                    {displayName(record)}
                  </p>
                </div>
                <time
                  dateTime={record.updated_at}
                  className="font-sans text-body-s tabular-nums text-muted sm:text-right"
                >
                  {formatDate(record.updated_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
