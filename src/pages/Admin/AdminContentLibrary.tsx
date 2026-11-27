import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm, {
  type FormField,
} from "../../features/admin/components/InlineForm";
import { useAuth } from "../../features/auth/auth-context";
import {
  createAdminArtifact,
  createAdminEvent,
  createAdminPerson,
  createAdminPlace,
  deleteAdminContent,
  getAdminContent,
  listAdminContent,
  setAdminContentPublished,
  updateAdminArtifact,
  updateAdminEvent,
  updateAdminPerson,
  updateAdminPlace,
  type AdminContentKind,
  type AdminContentRecord,
} from "../../features/admin/api/content";
import { getApiErrorMessage } from "../../services/api/client";
import type {
  DashboardArtifact,
  DashboardEvent,
  DashboardPerson,
  DashboardPlace,
} from "../../features/admin/types/dashboard";
import AdminEventRelationships from "../../features/admin/components/AdminEventRelationships";
import AdminEventMedia from "../../features/admin/components/AdminEventMedia";
import AdminPictures from "../../features/admin/components/AdminPictures";
import AdminSources from "../../features/admin/components/AdminSources";
import { PLACE_CATEGORIES, PLACE_REGIONS } from "../../features/places/types";
import { matchesSearch } from "../../lib/searchText";

const PAGE_SIZE = 50;

const kindInfo: Record<
  AdminContentKind,
  { singular: string; description: string }
> = {
  events: {
    singular: "event",
    description:
      "Create and manage events independently, then optionally connect them to a chapter, people, or places.",
  },
  people: {
    singular: "person",
    description:
      "Create people independently. Add them to events or exhibition chapters when you are ready.",
  },
  places: {
    singular: "place",
    description:
      "Create places independently. Add them to events or exhibition chapters when useful.",
  },
  artifacts: {
    singular: "artifact",
    description:
      "Create artifacts independently, or find the ones already attached to exhibition chapters.",
  },
};

const imageFields: FormField[] = [
  { name: "imageUrl", label: "Picture", kind: "image" },
  {
    name: "imageCredit",
    label: "Picture credit",
    placeholder: "Photographer or institution",
  },
  {
    name: "imageLicense",
    label: "Picture license",
    placeholder: "For example CC BY-SA 4.0",
  },
];

function titleOf(record: AdminContentRecord) {
  return "title" in record ? record.title : record.name;
}

function dateValue(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

function fieldsFor(
  kind: AdminContentKind,
  record?: AdminContentRecord,
): FormField[] {
  if (kind === "events") {
    const event = record as DashboardEvent | undefined;
    return [
      { name: "title", label: "Title", required: true, initial: event?.title },
      {
        name: "dateDisplay",
        label: "Date as readers see it",
        placeholder: "4 January 1897",
        initial: event?.date_display ?? "",
      },
      {
        name: "eventDate",
        label: "Exact date",
        kind: "date",
        initial: dateValue(event?.event_date ?? null),
        hint: "Used for ordering and for the big year at the top of a chapter.",
      },
      {
        name: "description",
        label: "Description",
        kind: "richtext",
        initial: event?.description ?? "",
        hint: "Add pictures and YouTube videos with the toolbar. Pictures are uploaded, never pasted in.",
      },
      {
        name: "imageUrl",
        label: "Image",
        kind: "image",
        initial: event?.image_url ?? "",
      },
    ];
  }

  if (kind === "people") {
    const person = record as DashboardPerson | undefined;
    return [
      { name: "name", label: "Name", required: true, initial: person?.name },
      {
        name: "description",
        label: "Description",
        kind: "textarea",
        initial: person?.description ?? "",
      },
      {
        name: "birthDate",
        label: "Born",
        kind: "date",
        initial: dateValue(person?.birth_date ?? null),
      },
      {
        name: "deathDate",
        label: "Died",
        kind: "date",
        initial: dateValue(person?.death_date ?? null),
      },
      ...(person ? [] : imageFields),
    ];
  }

  if (kind === "artifacts") {
    const artifact = record as DashboardArtifact | undefined;
    return [
      {
        name: "title",
        label: "Title",
        required: true,
        initial: artifact?.title ?? "",
      },
      {
        name: "artifactType",
        label: "Type",
        required: true,
        placeholder: "Document, photograph, object, map…",
        initial: artifact?.artifact_type ?? "",
      },
      {
        name: "dateDisplay",
        label: "Date as readers see it",
        placeholder: "1914",
        initial: artifact?.date_display ?? "",
      },
      {
        name: "description",
        label: "Description",
        kind: "textarea",
        initial: artifact?.description ?? "",
      },
      {
        name: "historicalContext",
        label: "Historical context",
        kind: "textarea",
        initial: artifact?.historical_context ?? "",
        hint: "Why this artifact matters and what was happening around it.",
      },
      ...(artifact ? [] : imageFields),
    ];
  }

  const place = record as DashboardPlace | undefined;
  return [
    { name: "name", label: "Name", required: true, initial: place?.name ?? "" },
    {
      name: "slug",
      label: "URL slug (optional)",
      placeholder: "Leave blank to keep the current slug",
      initial: place?.slug ?? "",
      hint: "New places get a slug from their name if this is left blank.",
    },
    {
      name: "summary",
      label: "Short introduction",
      kind: "textarea",
      rows: 3,
      initial: place?.summary ?? "",
      hint: "A friendly overview, up to 600 characters.",
    },
    {
      name: "region",
      label: "Region / state",
      kind: "select",
      initial: place?.region ?? "",
      options: [
        { value: "", label: "Choose a region (optional)" },
        ...PLACE_REGIONS.map((region) => ({ value: region, label: region })),
      ],
    },
    {
      name: "category",
      label: "Place type",
      kind: "select",
      initial: place?.category ?? "",
      options: [
        { value: "", label: "Choose a type (optional)" },
        ...PLACE_CATEGORIES,
      ],
    },
    {
      name: "coordinates",
      label: "Map pin",
      kind: "location",
      required: true,
      initial:
        place?.latitude != null && place.longitude != null
          ? `${place.latitude}, ${place.longitude}`
          : "",
      hint: "Choose the location on the map or paste coordinates / a Google Maps link.",
    },
    {
      name: "description",
      label: "Description",
      kind: "richtext",
      initial: place?.description ?? "",
      hint: "Tell the story of this place. Use headings, lists, links and images inserted by URL.",
    },
    {
      name: "coverImageUrl",
      label: "Cover image",
      kind: "image",
      initial: place?.cover_image_url ?? "",
      creditField: "coverImageCredit",
    },
    {
      name: "coverImageAlt",
      label: "Cover image description",
      initial: place?.cover_image_alt ?? "",
      hint: "Describe the image for visitors using a screen reader.",
    },
    {
      name: "coverImageCredit",
      label: "Cover image credit",
      initial: place?.cover_image_credit ?? "",
      placeholder: "Photographer, artist or institution",
    },
  ];
}

function metaOf(kind: AdminContentKind, record: AdminContentRecord) {
  if (kind === "events") {
    const event = record as DashboardEvent;
    return [
      event.date_display,
      event.section_id ? "Connected to a chapter" : "Standalone",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (kind === "artifacts") {
    const artifact = record as DashboardArtifact;
    return [
      artifact.artifact_type,
      artifact.date_display,
      artifact.section_id ? "Connected to a chapter" : "Standalone",
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (kind === "places") {
    const place = record as DashboardPlace;
    return place.latitude != null && place.longitude != null
      ? `${place.latitude}, ${place.longitude}`
      : "Coordinates not set";
  }
  const person = record as DashboardPerson;
  return [
    person.birth_date && `Born ${dateValue(person.birth_date)}`,
    person.death_date && `Died ${dateValue(person.death_date)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

type StatusFilter = "all" | "published" | "draft";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

// The list, with search and a status filter. It is its own component so the
// search resets when you move between People, Places, Events and Artifacts.
function ContentList({
  kind,
  items,
}: {
  kind: AdminContentKind;
  items: AdminContentRecord[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const matches = items.filter((item) => {
    if (statusFilter === "published" && item.status !== "published") {
      return false;
    }
    if (statusFilter === "draft" && item.status === "published") return false;

    return matchesSearch(search, titleOf(item), item.description);
  });
  const visible = matches.slice(0, limit);

  return (
    <div className="py-10">
      {items.length === 0 ? (
        <p className="font-sans text-body-m text-muted">
          No {kind} yet. Create the first one above.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full max-w-sm">
              <label htmlFor="admin-search" className="sr-only">
                Search {kind}
              </label>
              <input
                id="admin-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setLimit(PAGE_SIZE);
                }}
                placeholder={`Search ${kind}`}
                className="h-11 w-full border border-line bg-transparent px-4 font-sans text-body-s transition-colors focus:border-heritage-green"
              />
            </div>

            <div className="flex gap-2" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={statusFilter === filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setLimit(PAGE_SIZE);
                  }}
                  className={`h-11 border px-4 font-sans text-body-s transition-colors ${
                    statusFilter === filter.value
                      ? "border-heritage-green bg-heritage-green text-ivory"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <p
            role="status"
            className="mt-3 font-sans text-meta text-muted"
          >
            {matches.length} of {items.length}. Search ignores accents and tone
            marks, so “oyo” finds “Ọ̀yọ́”.
          </p>

          {matches.length === 0 ? (
            <p className="mt-8 font-sans text-body-m text-muted">
              Nothing matches. Try fewer letters or change the filter.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {visible.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/admin/${kind}/${item.id}`}
                    className="flex items-center justify-between gap-4 py-5 transition-colors hover:bg-heritage-green/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-heading-s">
                        {titleOf(item)}
                      </p>
                      <p className="truncate font-sans text-body-s text-muted">
                        {metaOf(kind, item)}
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
              ))}
            </ul>
          )}

          {matches.length > visible.length && (
            <button
              type="button"
              onClick={() => setLimit((count) => count + PAGE_SIZE)}
              className="mt-6 h-11 border border-line px-6 font-sans text-body-s transition-colors hover:border-heritage-green hover:text-heritage-green"
            >
              Show {Math.min(PAGE_SIZE, matches.length - visible.length)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminContentLibrary({
  kind,
}: {
  kind: AdminContentKind;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { showToast } = useAuth();
  const [items, setItems] = useState<AdminContentRecord[]>([]);
  const [record, setRecord] = useState<AdminContentRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("We couldn't load this content.");
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      if (id) {
        setRecord(await getAdminContent(kind, Number(id)));
      } else {
        setItems(await listAdminContent(kind));
        setRecord(null);
      }
      setLoadedKey(id ? `${kind}:${id}` : kind);
      setStatus("ready");
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "We couldn't load this content."));
      setStatus("error");
    }
  }, [id, kind]);

  useEffect(() => {
    let cancelled = false;
    async function fetchContent() {
      try {
        if (id) {
          const result = await getAdminContent(kind, Number(id));
          if (cancelled) return;
          setRecord(result);
        } else {
          const result = await listAdminContent(kind);
          if (cancelled) return;
          setItems(result);
          setRecord(null);
        }
        setLoadedKey(id ? `${kind}:${id}` : kind);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(error, "We couldn't load this content."),
          );
          setStatus("error");
        }
      }
    }

    void fetchContent();
    return () => {
      cancelled = true;
    };
  }, [id, kind]);

  const creating = !id && params.get("new") === "1";
  const info = kindInfo[kind];
  const published = record?.status === "published";
  const owner =
    kind === "people" ? "person" : kind === "artifacts" ? "artifact" : "place";

  function setCreating(open: boolean) {
    setParams(open ? { new: "1" } : {}, { replace: true });
  }

  async function create(values: Record<string, string>) {
    let created: { id: number; imageAttachmentError?: string };
    if (kind === "events") created = await createAdminEvent(values);
    else if (kind === "people") created = await createAdminPerson(values);
    else if (kind === "artifacts") created = await createAdminArtifact(values);
    else created = await createAdminPlace(values);

    const label = `${info.singular[0].toUpperCase()}${info.singular.slice(1)}`;
    if (created.imageAttachmentError) {
      showToast(
        `${label} saved, but the picture could not be attached: ${created.imageAttachmentError}`,
        "error",
      );
    } else {
      showToast(`${label} saved as a draft.`);
    }
    navigate(`/admin/${kind}/${created.id}`);
  }

  async function update(values: Record<string, string>) {
    if (!id) return;
    const contentId = Number(id);
    let imageAttachmentError: string | undefined;
    if (kind === "events") await updateAdminEvent(contentId, values);
    else if (kind === "people") await updateAdminPerson(contentId, values);
    else if (kind === "artifacts") await updateAdminArtifact(contentId, values);
    else {
      const result = await updateAdminPlace(contentId, values);
      imageAttachmentError = result.imageAttachmentError;
    }

    const label = `${info.singular[0].toUpperCase()}${info.singular.slice(1)}`;
    showToast(
      imageAttachmentError
        ? `${label} saved, but the picture could not be attached: ${imageAttachmentError}`
        : `${label} saved.`,
      imageAttachmentError ? "error" : "success",
    );
    await load();
  }

  async function togglePublished() {
    if (!record) return;
    setBusy(true);
    try {
      await setAdminContentPublished(kind, record.id, !published);
      showToast(published ? "Item moved back to draft." : "Item published.");
      await load();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not change the status.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!record) return;
    setBusy(true);
    try {
      await deleteAdminContent(kind, record.id);
      showToast(
        `${info.singular[0].toUpperCase()}${info.singular.slice(1)} deleted.`,
      );
      navigate(`/admin/${kind}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not delete this item.",
        "error",
      );
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <PageError
          message={loadError}
          backTo={`/admin/${kind}`}
          backLabel={`Back to ${kind}`}
        />
      </div>
    );
  }

  if (
    status === "loading" ||
    loadedKey !== (id ? `${kind}:${id}` : kind) ||
    (id != null && record?.id !== Number(id))
  ) {
    return <PageLoader label={`Loading ${info.singular}…`} />;
  }

  if (id && record) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <Link
          to={`/admin/${kind}`}
          className="font-sans text-body-s text-muted hover:text-ink"
        >
          ← All {kind}
        </Link>
        <div className="mt-4">
          <AdminPageHeader
            title={titleOf(record)}
            description={
              published
                ? "Published. Visitors can see this item."
                : "Draft. Only admins can see this item."
            }
          />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            <InlineForm
              submitLabel="Save changes"
              keepValues
              fields={fieldsFor(kind, record)}
              onSubmit={update}
            />
            {kind === "events" ? (
              <>
                <AdminEventRelationships
                  event={record as DashboardEvent}
                  onChanged={load}
                />
                <AdminEventMedia eventId={record.id} />
                <AdminSources owner="event" id={record.id} />
              </>
            ) : (
              <>
                <AdminPictures
                  owner={owner}
                  id={record.id}
                  name={titleOf(record)}
                />
                <AdminSources owner={owner} id={record.id} />
                <p className="border border-line p-5 font-sans text-body-s leading-relaxed text-muted">
                  Relationships are managed from the event or exhibition
                  chapter where this {info.singular} is featured.
                </p>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <section className="border border-line p-5">
              <h2 className="font-display text-heading-s">Status</h2>
              <p className="mt-2 font-sans text-body-s capitalize text-muted">
                {record.status}
              </p>
              <button
                type="button"
                onClick={togglePublished}
                disabled={busy}
                className="mt-4 h-11 w-full bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest disabled:opacity-60"
              >
                {published ? "Move back to draft" : "Publish"}
              </button>
            </section>

            <section className="border border-line p-5">
              <h2 className="font-display text-heading-s">Delete</h2>
              <p className="mt-2 font-sans text-body-s text-muted">
                Removes this item for good.
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
                className="mt-4 h-11 border border-error px-6 font-sans text-body-s font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-60"
              >
                Delete {info.singular}
              </button>
            </section>
          </aside>
        </div>
        {confirmingDelete && (
          <ConfirmDialog
            title={`Delete this ${info.singular}?`}
            message="This removes the item for good. It can't be undone."
            confirmLabel={`Delete ${info.singular}`}
            danger
            busy={busy}
            onConfirm={remove}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title={`${kind[0].toUpperCase()}${kind.slice(1)}`}
        description={info.description}
        action={
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
            >
              New {info.singular}
            </button>
          )
        }
      />

      {creating && (
        <div className="mt-8 max-w-2xl">
          <InlineForm
            submitLabel={`Save ${info.singular} draft`}
            onCancel={() => setCreating(false)}
            fields={fieldsFor(kind)}
            onSubmit={create}
          />
          <p className="mt-3 font-sans text-meta text-muted">
            This will be saved as a standalone draft. You can add relationships
            and publish it later.
          </p>
        </div>
      )}

      <ContentList key={kind} kind={kind} items={items} />
    </div>
  );
}