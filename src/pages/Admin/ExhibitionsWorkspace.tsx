import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm, { type FormField } from "../../features/admin/components/InlineForm";
import {
  getAdminExhibitions,
  getAdminPeople,
  getAdminPlaces,
  getAdminSections,
} from "../../features/admin/api/dashboard";
import {
  addArtifact,
  addChapter,
  addEvent,
  addPerson,
  addPlace,
  addSource,
  getChapterContent,
  linkExisting,
  publishExhibition,
  setPublished,
  updateChapter,
  updateExhibition,
  type ChapterContent,
  type PublishKind,
} from "../../features/admin/api/workspace";
import type {
  DashboardExhibitionResponseItem,
  DashboardPerson,
  DashboardPlace,
  DashboardSection,
} from "../../features/admin/types/dashboard";
import { useAuth } from "../../features/auth/auth-context";

// ---------- The fields each form asks for ----------

const imageFields: FormField[] = [
  {
    name: "imageUrl",
    label: "Image",
    kind: "image",
  },
  { name: "imageCredit", label: "Image credit", placeholder: "Photographer or institution" },
  { name: "imageLicense", label: "Image license", placeholder: "For example CC BY-SA 4.0" },
];

const eventFields: FormField[] = [
  { name: "title", label: "Title", required: true },
  { name: "dateDisplay", label: "Date as readers see it", placeholder: "4 January 1897" },
  {
    name: "eventDate",
    label: "Exact date",
    kind: "date",
    hint: "Used for ordering and for the big year at the top of the chapter.",
  },
  { name: "description", label: "Description", kind: "textarea" },
  { name: "imageUrl", label: "Image", kind: "image" },
];

const personFields: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "description", label: "Description", kind: "textarea" },
  { name: "birthDate", label: "Born", kind: "date" },
  { name: "deathDate", label: "Died", kind: "date" },
  ...imageFields,
];

const placeFields: FormField[] = [
  { name: "name", label: "Name", required: true },
  {
    name: "coordinates",
    label: "Coordinates",
    required: true,
    placeholder: "6.3350, 5.6037",
    hint: "In Google Maps, right-click the spot and click the numbers to copy them.",
  },
  { name: "description", label: "Description", kind: "textarea" },
  ...imageFields,
];

const sourceFields: FormField[] = [
  { name: "title", label: "Title", required: true },
  {
    name: "sourceType",
    label: "Type",
    kind: "select",
    initial: "Website",
    options: ["Book", "Article", "Website", "Archive document", "Museum page", "Other"].map(
      (value) => ({ value, label: value }),
    ),
  },
  { name: "publication", label: "Publication or publisher" },
  { name: "url", label: "Link" },
];

// ---------- Small building blocks ----------

const textButton =
  "font-sans text-body-s underline underline-offset-4 hover:text-heritage-green";

function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={`border px-2 py-0.5 font-sans text-meta capitalize ${
        status === "published"
          ? "border-heritage-green/40 text-heritage-green"
          : "border-line text-muted"
      }`}
    >
      {status}
    </span>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="py-6">
      <h3 className="font-sans text-label font-medium uppercase tracking-widest text-muted">
        {title} <span className="ml-1 text-ochre">{count}</span>
      </h3>
      {children}
    </section>
  );
}

function Row({
  title,
  meta,
  status,
  onToggle,
}: {
  title: string;
  meta?: string | null;
  status?: string;
  onToggle?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-sans text-body-s text-ink">{title}</p>
        {meta && <p className="truncate font-sans text-meta text-muted">{meta}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {status && <StatusChip status={status} />}
        {onToggle && (
          <button type="button" onClick={onToggle} className={`${textButton} text-meta`}>
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        )}
      </div>
    </li>
  );
}

// ---------- One chapter ----------

type Mode =
  | "edit"
  | "event"
  | "artifact"
  | "person-new"
  | "person-existing"
  | "place-new"
  | "place-existing"
  | "source"
  | null;

function ChapterPanel({
  section,
  people,
  places,
  onLibraryChanged,
  onSectionChanged,
}: {
  section: DashboardSection;
  people: DashboardPerson[];
  places: DashboardPlace[];
  onLibraryChanged: () => void;
  onSectionChanged: () => void;
}) {
  const { showToast } = useAuth();
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [mode, setMode] = useState<Mode>(null);

  const load = useCallback(async () => {
    try {
      setContent(await getChapterContent(section.id));
    } catch {
      showToast("Couldn't load this chapter.", "error");
    }
  }, [section.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Runs an action, refreshes the chapter, and closes the form.
  async function run(action: () => Promise<unknown>, done: string) {
    await action();
    await load();
    setMode(null);
    showToast(done);
  }

  async function toggle(kind: PublishKind, id: number, status: string) {
    try {
      await setPublished(kind, id, status !== "published");
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Couldn't change that.", "error");
    }
  }

  async function publishDrafts() {
    if (!content) return;

    const drafts = [
      ...content.events.map((item) => ({ ...item, kind: "events" as const })),
      ...content.artifacts.map((item) => ({ ...item, kind: "artifacts" as const })),
      ...content.people.map((item) => ({ ...item, kind: "people" as const })),
      ...content.places.map((item) => ({ ...item, kind: "places" as const })),
    ].filter((item) => item.status !== "published");

    try {
      await Promise.all(drafts.map((item) => setPublished(item.kind, item.id, true)));
      await load();
      showToast(`Published ${drafts.length} item${drafts.length === 1 ? "" : "s"}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Couldn't publish.", "error");
    }
  }

  if (!content) {
    return <p className="px-1 py-6 font-sans text-body-s text-muted">Loading chapter…</p>;
  }

  const draftCount = [
    ...content.events,
    ...content.artifacts,
    ...content.people,
    ...content.places,
  ].filter((item) => item.status !== "published").length;

  const freePeople = people.filter((p) => !content.people.some((c) => c.id === p.id));
  const freePlaces = places.filter((p) => !content.places.some((c) => c.id === p.id));

  const cancel = () => setMode(null);

  return (
    <div className="divide-y divide-line">
      {/* Chapter details */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <button type="button" onClick={() => setMode(mode === "edit" ? null : "edit")} className={textButton}>
          {mode === "edit" ? "Close" : "Edit chapter details"}
        </button>

        {draftCount > 0 && (
          <button type="button" onClick={publishDrafts} className={textButton}>
            Publish {draftCount} draft{draftCount === 1 ? "" : "s"} in this chapter
          </button>
        )}
      </div>

      {mode === "edit" && (
        <div className="py-5">
          <InlineForm
            keepValues
            submitLabel="Save chapter"
            onCancel={cancel}
            fields={[
              { name: "title", label: "Title", required: true, initial: section.title },
              { name: "introduction", label: "Introduction", kind: "textarea", initial: section.introduction ?? "" },
              {
                name: "heroImageUrl",
                label: "Hero image",
                kind: "image",
                initial: section.hero_image_url ?? "",
                hint: "The big picture at the top of this chapter in the experience.",
              },
            ]}
            onSubmit={async (values) => {
              await updateChapter(section.id, values);
              onSectionChanged();
              setMode(null);
              showToast("Chapter saved.");
            }}
          />
        </div>
      )}

      {/* Events */}
      <Group title="Events" count={content.events.length}>
        <ul className="divide-y divide-line">
          {content.events.map((item) => (
            <Row key={item.id} title={item.title} meta={item.date_display} status={item.status} onToggle={() => toggle("events", item.id, item.status)} />
          ))}
        </ul>
        {mode === "event" ? (
          <div className="mt-3">
            <InlineForm fields={eventFields} submitLabel="Add event" onCancel={cancel} onSubmit={(v) => run(() => addEvent(section.id, v), "Event added.")} />
          </div>
        ) : (
          <button type="button" onClick={() => setMode("event")} className={`${textButton} mt-3`}>+ Add event</button>
        )}
      </Group>

      {/* Artifacts */}
      <Group title="Artifacts" count={content.artifacts.length}>
        <ul className="divide-y divide-line">
          {content.artifacts.map((item) => (
            <Row key={item.id} title={item.title} meta={item.artifact_type} status={item.status} onToggle={() => toggle("artifacts", item.id, item.status)} />
          ))}
        </ul>
        {mode === "artifact" ? (
          <div className="mt-3">
            <InlineForm
              submitLabel="Add artifact"
              onCancel={cancel}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "artifactType", label: "Type", required: true, placeholder: "Photograph, document, brass plaque" },
                { name: "dateDisplay", label: "Date as readers see it" },
                {
                  name: "placeId",
                  label: "Place",
                  kind: "select",
                  options: [{ value: "", label: "No place" }, ...places.map((p) => ({ value: String(p.id), label: p.name }))],
                },
                { name: "description", label: "Description", kind: "textarea" },
                ...imageFields,
              ]}
              onSubmit={(v) => run(() => addArtifact(section.id, v), "Artifact added.")}
            />
          </div>
        ) : (
          <button type="button" onClick={() => setMode("artifact")} className={`${textButton} mt-3`}>+ Add artifact</button>
        )}
      </Group>

      {/* People */}
      <Group title="People" count={content.people.length}>
        <ul className="divide-y divide-line">
          {content.people.map((item) => (
            <Row key={item.id} title={item.name} status={item.status} onToggle={() => toggle("people", item.id, item.status)} />
          ))}
        </ul>
        {mode === "person-new" && (
          <div className="mt-3">
            <InlineForm fields={personFields} submitLabel="Add person" onCancel={cancel} onSubmit={(v) => run(async () => { await addPerson(section.id, v); onLibraryChanged(); }, "Person added.")} />
          </div>
        )}
        {mode === "person-existing" && (
          <div className="mt-3">
            <InlineForm
              submitLabel="Add to chapter"
              onCancel={cancel}
              fields={[{ name: "id", label: "Person", kind: "select", required: true, options: [{ value: "", label: "Choose…" }, ...freePeople.map((p) => ({ value: String(p.id), label: p.name }))] }]}
              onSubmit={(v) => run(() => linkExisting("people", section.id, Number(v.id)), "Person added.")}
            />
          </div>
        )}
        {mode !== "person-new" && mode !== "person-existing" && (
          <div className="mt-3 flex gap-6">
            <button type="button" onClick={() => setMode("person-new")} className={textButton}>+ New person</button>
            {freePeople.length > 0 && (
              <button type="button" onClick={() => setMode("person-existing")} className={textButton}>+ Existing person</button>
            )}
          </div>
        )}
      </Group>

      {/* Places */}
      <Group title="Places" count={content.places.length}>
        <ul className="divide-y divide-line">
          {content.places.map((item) => (
            <Row key={item.id} title={item.name} status={item.status} onToggle={() => toggle("places", item.id, item.status)} />
          ))}
        </ul>
        {mode === "place-new" && (
          <div className="mt-3">
            <InlineForm fields={placeFields} submitLabel="Add place" onCancel={cancel} onSubmit={(v) => run(async () => { await addPlace(section.id, v); onLibraryChanged(); }, "Place added.")} />
          </div>
        )}
        {mode === "place-existing" && (
          <div className="mt-3">
            <InlineForm
              submitLabel="Add to chapter"
              onCancel={cancel}
              fields={[{ name: "id", label: "Place", kind: "select", required: true, options: [{ value: "", label: "Choose…" }, ...freePlaces.map((p) => ({ value: String(p.id), label: p.name }))] }]}
              onSubmit={(v) => run(() => linkExisting("places", section.id, Number(v.id)), "Place added.")}
            />
          </div>
        )}
        {mode !== "place-new" && mode !== "place-existing" && (
          <div className="mt-3 flex gap-6">
            <button type="button" onClick={() => setMode("place-new")} className={textButton}>+ New place</button>
            {freePlaces.length > 0 && (
              <button type="button" onClick={() => setMode("place-existing")} className={textButton}>+ Existing place</button>
            )}
          </div>
        )}
      </Group>

      {/* Sources */}
      <Group title="Sources" count={content.sources.length}>
        <ul className="divide-y divide-line">
          {content.sources.map((item) => (
            <Row key={item.id} title={item.title} meta={item.source_type} />
          ))}
        </ul>
        {mode === "source" ? (
          <div className="mt-3">
            <InlineForm fields={sourceFields} submitLabel="Add source" onCancel={cancel} onSubmit={(v) => run(() => addSource(section.id, v), "Source added.")} />
          </div>
        ) : (
          <button type="button" onClick={() => setMode("source")} className={`${textButton} mt-3`}>+ Add source</button>
        )}
      </Group>
    </div>
  );
}

// ---------- The page ----------

export default function ExhibitionWorkspace() {
  const { id } = useParams<{ id: string }>();
  const exhibitionId = Number(id);
  const { showToast } = useAuth();

  const [exhibition, setExhibition] = useState<DashboardExhibitionResponseItem | null>(null);
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [people, setPeople] = useState<DashboardPerson[]>([]);
  const [places, setPlaces] = useState<DashboardPlace[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [openId, setOpenId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);

  const loadExhibition = useCallback(async () => {
    const all = await getAdminExhibitions();
    setExhibition(all.exhibitions.find((item) => item.id === exhibitionId) ?? null);
  }, [exhibitionId]);

  const loadSections = useCallback(async () => {
    const list = await getAdminSections(exhibitionId);
    setSections([...list].sort((a, b) => a.section_order - b.section_order));
  }, [exhibitionId]);

  const loadLibrary = useCallback(async () => {
    const [p, pl] = await Promise.all([getAdminPeople(), getAdminPlaces()]);
    setPeople(p);
    setPlaces(pl);
  }, []);

  useEffect(() => {
    Promise.all([loadExhibition(), loadSections(), loadLibrary()])
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, [loadExhibition, loadSections, loadLibrary]);

  if (status === "loading") {
    return <p className="px-8 py-12 font-sans text-body-s text-muted">Loading…</p>;
  }

  if (status === "error" || !exhibition) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <p className="font-sans text-body-m text-muted">We couldn't find this exhibition.</p>
        <Link to="/admin/exhibitions" className={`${textButton} mt-4 inline-block`}>
          Back to exhibitions
        </Link>
      </div>
    );
  }

  const published = exhibition.status === "published";

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <Link to="/admin/exhibitions" className="font-sans text-body-s text-muted hover:text-ink">
        ← Exhibitions
      </Link>

      <div className="mt-4">
        <AdminPageHeader
          title={exhibition.title}
          description={exhibition.subtitle ?? undefined}
          action={
            published ? (
              <div className="flex items-center gap-5">
                <StatusChip status="published" />
                <Link to={`/experiences/${exhibition.slug}`} className={textButton}>
                  Open experience
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await publishExhibition(exhibition.id);
                    await loadExhibition();
                    showToast("Exhibition published.");
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Couldn't publish.", "error");
                  }
                }}
                className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
              >
                Publish exhibition
              </button>
            )
          }
        />
      </div>

      <p className="mt-4 max-w-2xl font-sans text-body-s text-muted">
        Visitors only see items that are published, inside a published exhibition.
      </p>

      {/* Exhibition details */}
      <div className="mt-6">
        <button type="button" onClick={() => setEditing(!editing)} className={textButton}>
          {editing ? "Close" : "Edit exhibition details"}
        </button>

        {editing && (
          <div className="mt-4 max-w-xl">
            <InlineForm
              keepValues
              submitLabel="Save details"
              onCancel={() => setEditing(false)}
              fields={[
                { name: "title", label: "Title", required: true, initial: exhibition.title },
                { name: "subtitle", label: "Subtitle", initial: exhibition.subtitle ?? "" },
                { name: "description", label: "Description", kind: "textarea", initial: exhibition.description ?? "" },
                { name: "coverImageUrl", label: "Cover image", kind: "image", initial: exhibition.cover_image_url ?? "" },
              ]}
              onSubmit={async (values) => {
                await updateExhibition(exhibition.id, values);
                await loadExhibition();
                setEditing(false);
                showToast("Details saved.");
              }}
            />
          </div>
        )}
      </div>

      {/* Chapters */}
      <h2 className="mt-14 font-display text-heading-m">Chapters</h2>

      {sections.length === 0 && (
        <p className="mt-3 font-sans text-body-m text-muted">
          No chapters yet. Add the first one to start building.
        </p>
      )}

      <ol className="mt-4 divide-y divide-line border-y border-line">
        {sections.map((section, index) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => setOpenId(openId === section.id ? null : section.id)}
              aria-expanded={openId === section.id}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:bg-heritage-green/5"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-display text-heading-s text-ochre">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-heading-s">{section.title}</span>
              </span>
              <span aria-hidden className="text-muted">
                {openId === section.id ? "−" : "+"}
              </span>
            </button>

            {openId === section.id && (
              <div className="pb-4">
                <ChapterPanel
                  section={section}
                  people={people}
                  places={places}
                  onLibraryChanged={loadLibrary}
                  onSectionChanged={loadSections}
                />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 max-w-xl">
        {addingChapter ? (
          <InlineForm
            submitLabel="Add chapter"
            onCancel={() => setAddingChapter(false)}
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "introduction", label: "Introduction", kind: "textarea" },
              { name: "heroImageUrl", label: "Hero image", kind: "image", hint: "Optional. You can add it later." },
            ]}
            onSubmit={async (values) => {
              await addChapter(exhibition.id, sections.length + 1, values);
              await loadSections();
              setAddingChapter(false);
              showToast("Chapter added.");
            }}
          />
        ) : (
          <button type="button" onClick={() => setAddingChapter(true)} className={textButton}>
            + Add chapter
          </button>
        )}
      </div>
    </div>
  );
}