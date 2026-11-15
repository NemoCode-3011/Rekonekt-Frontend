import { useCallback, useEffect, useState, type ReactNode } from "react";
import InlineForm, { type FormField } from "./InlineForm";
import { useAuth } from "../../auth/auth-context";
import {
  createAdminPerson,
  createAdminPlace,
  getAdminEventPeople,
  getAdminEventPlaces,
  linkEventPerson,
  linkEventPlace,
  setEventSection,
  unlinkEventPerson,
  unlinkEventPlace,
} from "../api/content";
import {
  getAdminExhibitions,
  getAdminPeople,
  getAdminPlaces,
  getAdminSections,
} from "../api/dashboard";
import type {
  DashboardEvent,
  DashboardPerson,
  DashboardPlace,
  DashboardSection,
} from "../types/dashboard";
import type { DashboardExhibitionResponseItem } from "../types/dashboard";

type Mode = "person" | "place" | "new-person" | "new-place" | null;

async function fetchEventRelationships(eventId: number) {
  const [people, places, allPeople, allPlaces, exhibitionsResult] =
    await Promise.all([
      getAdminEventPeople(eventId),
      getAdminEventPlaces(eventId),
      getAdminPeople(),
      getAdminPlaces(),
      getAdminExhibitions(),
    ]);
  const sectionLists = await Promise.all(
    exhibitionsResult.exhibitions.map((exhibition) =>
      getAdminSections(exhibition.id),
    ),
  );

  return {
    people,
    places,
    allPeople,
    allPlaces,
    exhibitions: exhibitionsResult.exhibitions,
    sections: sectionLists.flat(),
  };
}

const personFields: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "description", label: "Description", kind: "textarea" },
  { name: "birthDate", label: "Born", kind: "date" },
  { name: "deathDate", label: "Died", kind: "date" },
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

const placeFields: FormField[] = [
  { name: "name", label: "Name", required: true },
  {
    name: "coordinates",
    label: "Coordinates",
    required: true,
    placeholder: "6.3350, 5.6037",
    hint: "In Google Maps, right-click the spot and copy the coordinates.",
  },
  { name: "description", label: "Description", kind: "textarea" },
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

const linkButton =
  "font-sans text-body-s underline underline-offset-4 hover:text-heritage-green";

export default function AdminEventRelationships({
  event,
  onChanged,
}: {
  event: DashboardEvent;
  onChanged: () => Promise<void>;
}) {
  const { showToast } = useAuth();
  const [people, setPeople] = useState<DashboardPerson[]>([]);
  const [places, setPlaces] = useState<DashboardPlace[]>([]);
  const [allPeople, setAllPeople] = useState<DashboardPerson[]>([]);
  const [allPlaces, setAllPlaces] = useState<DashboardPlace[]>([]);
  const [exhibitions, setExhibitions] = useState<
    DashboardExhibitionResponseItem[]
  >([]);
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [sectionId, setSectionId] = useState(
    event.section_id == null ? "" : String(event.section_id),
  );
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEventRelationships(event.id);
      setPeople(data.people);
      setPlaces(data.places);
      setAllPeople(data.allPeople);
      setAllPlaces(data.allPlaces);
      setExhibitions(data.exhibitions);
      setSections(data.sections);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    let cancelled = false;
    fetchEventRelationships(event.id)
      .then((data) => {
        if (cancelled) return;
        setPeople(data.people);
        setPlaces(data.places);
        setAllPeople(data.allPeople);
        setAllPlaces(data.allPlaces);
        setExhibitions(data.exhibitions);
        setSections(data.sections);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event.id]);

  const currentSection = sections.find(
    (section) => section.id === event.section_id,
  );
  const freePeople = allPeople.filter(
    (person) => !people.some((linked) => linked.id === person.id),
  );
  const freePlaces = allPlaces.filter(
    (place) => !places.some((linked) => linked.id === place.id),
  );
  const sectionChanged =
    (sectionId === "" ? null : Number(sectionId)) !== event.section_id;

  async function saveSection() {
    setSavingSection(true);
    try {
      await setEventSection(
        event.id,
        sectionId === "" ? null : Number(sectionId),
      );
      await onChanged();
      showToast(sectionId ? "Event connected to a chapter." : "Event is now standalone.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save the chapter link.",
        "error",
      );
    } finally {
      setSavingSection(false);
    }
  }

  async function createAndLink(kind: "person" | "place", values: Record<string, string>) {
    const created =
      kind === "person"
        ? await createAdminPerson(values)
        : await createAdminPlace(values);
    const imageAttachmentError =
      "imageAttachmentError" in created
        ? created.imageAttachmentError
        : undefined;

    try {
      if (kind === "person") await linkEventPerson(event.id, created.id);
      else await linkEventPlace(event.id, created.id);
      setMode(null);
      await refresh();
      const label = kind === "person" ? "Person" : "Place";
      if (imageAttachmentError) {
        showToast(
          `${label} created and linked, but its picture could not be attached: ${imageAttachmentError}`,
          "error",
        );
      } else {
        showToast(`${label} created and linked to this event.`);
      }
    } catch (error) {
      setMode(null);
      await refresh();
      showToast(
        error instanceof Error
          ? `${kind[0].toUpperCase()}${kind.slice(1)} was created, but the event link could not be saved: ${error.message}${imageAttachmentError ? ` The picture could not be attached: ${imageAttachmentError}` : ""}`
          : `${kind[0].toUpperCase()}${kind.slice(1)} was created, but the event link could not be saved.${imageAttachmentError ? ` The picture could not be attached: ${imageAttachmentError}` : ""}`,
        "error",
      );
    }
  }

  async function removePerson(person: DashboardPerson) {
    try {
      await unlinkEventPerson(event.id, person.id);
      await refresh();
      showToast("Person removed from event.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not remove the person.",
        "error",
      );
    }
  }

  async function removePlace(place: DashboardPlace) {
    try {
      await unlinkEventPlace(event.id, place.id);
      await refresh();
      showToast(
        "Place removed from event.",
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not remove the place.",
        "error",
      );
    }
  }

  return (
    <section className="border border-line p-5">
      <h2 className="font-display text-heading-s">Relationships</h2>
      <p className="mt-2 font-sans text-body-s text-muted">
        All connections are optional. The event can remain standalone.
      </p>

      {loading && (
        <p role="status" className="mt-5 font-sans text-body-s text-muted">
          Loading connections…
        </p>
      )}
      {loadError && (
        <div role="alert" className="mt-5">
          <p className="font-sans text-body-s text-error">
            Couldn’t load the event connections.
          </p>
          <button type="button" onClick={() => void refresh()} className={linkButton}>
            Try again
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="mt-5 space-y-8">
          <div>
            <h3 className="font-sans text-label font-medium uppercase tracking-widest text-muted">
              Exhibition chapter
            </h3>
            <p className="mt-2 font-sans text-body-s text-muted">
              {currentSection
                ? `Connected to ${currentSection.title}.`
                : event.section_id == null
                  ? "Standalone event."
                  : "Connected to a chapter."}
            </p>
            <label
              htmlFor="event-section"
              className="mb-1.5 mt-4 block font-sans text-label font-medium uppercase tracking-widest text-muted"
            >
              Chapter
            </label>
            <select
              id="event-section"
              value={sectionId}
              onChange={(change) => setSectionId(change.target.value)}
              className="w-full border border-line bg-transparent px-3 py-2.5 font-sans text-body-s outline-none focus:border-heritage-green"
            >
              <option value="">None (standalone)</option>
              {sections.map((section) => {
                const exhibition = exhibitions.find(
                  (item) => item.id === section.exhibition_id,
                );
                return (
                  <option key={section.id} value={section.id}>
                    {exhibition ? `${exhibition.title} · ` : ""}
                    {section.section_order}. {section.title}
                  </option>
                );
              })}
            </select>
            {sectionChanged && (
              <button
                type="button"
                onClick={saveSection}
                disabled={savingSection}
                className="mt-4 h-10 bg-heritage-green px-5 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest disabled:opacity-60"
              >
                {savingSection ? "Saving…" : "Save chapter"}
              </button>
            )}
          </div>

          <RelationshipList
            title="People"
            noun="person"
            items={people.map((person) => ({
              id: person.id,
              title: person.name,
              status: person.status,
              onRemove: () => void removePerson(person),
            }))}
            actions={
              mode === "person" ? (
                <InlineForm
                  submitLabel="Link person"
                  onCancel={() => setMode(null)}
                  fields={[
                    {
                      name: "id",
                      label: "Person",
                      kind: "select",
                      required: true,
                      options: [
                        { value: "", label: "Choose a person" },
                        ...freePeople.map((person) => ({
                          value: String(person.id),
                          label: person.name,
                        })),
                      ],
                    },
                  ]}
                  onSubmit={async (values) => {
                    await linkEventPerson(event.id, Number(values.id));
                    setMode(null);
                    await refresh();
                    showToast("Person linked to event.");
                  }}
                />
              ) : mode === "new-person" ? (
                <InlineForm
                  submitLabel="Create and link person"
                  onCancel={() => setMode(null)}
                  fields={personFields}
                  onSubmit={(values) => createAndLink("person", values)}
                />
              ) : null
            }
            onLinkExisting={() => setMode("person")}
            onCreateNew={() => setMode("new-person")}
            disabled={loading || loadError || mode !== null}
            canLinkExisting={freePeople.length > 0}
          />

          <RelationshipList
            title="Places"
            noun="place"
            items={places.map((place) => ({
              id: place.id,
              title: place.name,
              status: place.status,
              onRemove: () => void removePlace(place),
            }))}
            actions={
              mode === "place" ? (
                <InlineForm
                  submitLabel="Link place"
                  onCancel={() => setMode(null)}
                  fields={[
                    {
                      name: "id",
                      label: "Place",
                      kind: "select",
                      required: true,
                      options: [
                        { value: "", label: "Choose a place" },
                        ...freePlaces.map((place) => ({
                          value: String(place.id),
                          label: place.name,
                        })),
                      ],
                    },
                  ]}
                  onSubmit={async (values) => {
                    await linkEventPlace(event.id, Number(values.id));
                    setMode(null);
                    await refresh();
                    showToast("Place linked to event.");
                  }}
                />
              ) : mode === "new-place" ? (
                <InlineForm
                  submitLabel="Create and link place"
                  onCancel={() => setMode(null)}
                  fields={placeFields}
                  onSubmit={(values) => createAndLink("place", values)}
                />
              ) : null
            }
            onLinkExisting={() => setMode("place")}
            onCreateNew={() => setMode("new-place")}
            disabled={loading || loadError || mode !== null}
            canLinkExisting={freePlaces.length > 0}
          />
        </div>
      )}
    </section>
  );
}

function RelationshipList({
  title,
  noun,
  items,
  actions,
  canLinkExisting = true,
  canCreate = true,
  onLinkExisting,
  onCreateNew,
  disabled,
}: {
  title: string;
  noun: string;
  items: {
    id: number;
    title: string;
    status: string;
    onRemove: () => void;
  }[];
  actions: ReactNode;
  canLinkExisting?: boolean;
  canCreate?: boolean;
  onLinkExisting: () => void;
  onCreateNew: () => void;
  disabled: boolean;
}) {
  return (
    <div>
      <h3 className="font-sans text-label font-medium uppercase tracking-widest text-muted">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 font-sans text-body-s text-muted">
          No {title.toLowerCase()} linked.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-sans text-body-s">{item.title}</p>
                <p className="font-sans text-meta capitalize text-muted">
                  {item.status}
                </p>
              </div>
              <button
                type="button"
                onClick={item.onRemove}
                className="shrink-0 font-sans text-meta text-muted underline underline-offset-4 hover:text-error"
                aria-label={`Remove ${item.title} from this event`}
              >
                Remove link
              </button>
            </li>
          ))}
        </ul>
      )}
      {actions ? (
        <div className="mt-3">{actions}</div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-5">
          <button
            type="button"
            disabled={disabled || !canLinkExisting}
            onClick={onLinkExisting}
            className={linkButton}
          >
            + Existing {noun}
          </button>
          <button
            type="button"
            disabled={disabled || !canCreate}
            onClick={onCreateNew}
            className={linkButton}
          >
            + New {noun}
          </button>
        </div>
      )}
    </div>
  );
}
