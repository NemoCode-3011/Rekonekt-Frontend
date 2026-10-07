import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../../auth/auth-context";
import Button from "../../../components/ui/Button";
import type {
  CreateContentKind,
  DashboardPlace,
  DashboardExhibition,
  DashboardSection,
} from "../types/dashboard";
import {
  createArtifact,
  createEvent,
  createExhibition,
  createPerson,
  createPlace,
  createStory,
} from "../api/dashboard";

interface AdminQuickActionsProps {
  exhibitions: DashboardExhibition[] | null;
  sections: DashboardSection[] | null;
  places: DashboardPlace[] | null;
  sectionsError: string | null;
  onCreated: () => Promise<void>;
}

interface FormValues {
  title: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  eventDate: string;
  dateDisplay: string;
  imageUrl: string;
  birthDate: string;
  deathDate: string;
  latitude: string;
  longitude: string;
  artifactType: string;
  historicalContext: string;
  placeId: string;
  excerpt: string;
  content: string;
  exhibitionId: string;
  sectionId: string;
}

const emptyForm: FormValues = {
  title: "",
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  startDate: "",
  endDate: "",
  coverImageUrl: "",
  eventDate: "",
  dateDisplay: "",
  imageUrl: "",
  birthDate: "",
  deathDate: "",
  latitude: "",
  longitude: "",
  artifactType: "",
  historicalContext: "",
  placeId: "",
  excerpt: "",
  content: "",
  exhibitionId: "",
  sectionId: "",
};

const actions: { kind: CreateContentKind; label: string }[] = [
  { kind: "exhibition", label: "Create exhibition" },
  { kind: "event", label: "Add event" },
  { kind: "person", label: "Add person" },
  { kind: "place", label: "Add place" },
  { kind: "artifact", label: "Add artifact" },
  { kind: "story", label: "Add story" },
];

const slugPattern = "[a-z0-9]+(?:-[a-z0-9]+)*";

const requiredFields: Record<
  CreateContentKind,
  { key: keyof FormValues; label: string; minimum: number }[]
> = {
  exhibition: [
    { key: "title", label: "Title", minimum: 2 },
    { key: "slug", label: "Slug", minimum: 2 },
    { key: "startDate", label: "Start date", minimum: 1 },
  ],
  event: [
    { key: "title", label: "Title", minimum: 2 },
    { key: "slug", label: "Slug", minimum: 2 },
    { key: "sectionId", label: "Section", minimum: 1 },
  ],
  person: [
    { key: "name", label: "Name", minimum: 2 },
    { key: "slug", label: "Slug", minimum: 2 },
  ],
  place: [{ key: "name", label: "Name", minimum: 2 }],
  artifact: [
    { key: "title", label: "Title", minimum: 2 },
    { key: "slug", label: "Slug", minimum: 2 },
    { key: "artifactType", label: "Artifact type", minimum: 2 },
    { key: "sectionId", label: "Section", minimum: 1 },
  ],
  story: [
    { key: "title", label: "Title", minimum: 2 },
    { key: "slug", label: "Slug", minimum: 2 },
    { key: "content", label: "Story content", minimum: 1 },
    { key: "sectionId", label: "Section", minimum: 1 },
  ],
};

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  step?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  children?: ReactNode;
}) {
  const fieldClass =
    "h-11 w-full border border-line bg-transparent px-3 font-sans text-body-s text-ink outline-none transition-colors focus:border-heritage-green";

  return (
    <label className="block">
      <span className="mb-2 block font-sans text-label font-medium uppercase tracking-[0.14em] text-muted">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children ?? (
        <input
          name={name}
          type={type}
          value={value}
          required={required}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          onChange={(event) => onChange?.(event.target.value)}
          className={fieldClass}
        />
      )}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  required,
  rows = 3,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-label font-medium uppercase tracking-[0.14em] text-muted">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <textarea
        name={name}
        value={value}
        required={required}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-line bg-transparent px-3 py-2 font-sans text-body-s text-ink outline-none transition-colors focus:border-heritage-green"
      />
    </label>
  );
}

function optionalValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value.trim() !== ""),
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "We couldn't create this item. Please try again.";
}

export default function AdminQuickActions({
  exhibitions,
  sections,
  places,
  sectionsError,
  onCreated,
}: AdminQuickActionsProps) {
  const { showToast } = useAuth();
  const [activeKind, setActiveKind] = useState<CreateContentKind | null>(null);
  const [values, setValues] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSections =
    sections?.filter(
      (section) => String(section.exhibition_id) === values.exhibitionId,
    ) ?? [];

  function updateValue(name: keyof FormValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "exhibitionId" ? { sectionId: "" } : {}),
    }));
    setError(null);
  }

  function openForm(kind: CreateContentKind) {
    setValues(emptyForm);
    setError(null);
    setActiveKind(kind);
  }

  function closeForm() {
    if (submitting) return;
    setActiveKind(null);
    setValues(emptyForm);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeKind) return;

    const invalidField = requiredFields[activeKind].find(
      ({ key, minimum }) => values[key].trim().length < minimum,
    );
    if (invalidField) {
      setError(
        invalidField.minimum === 1
          ? `${invalidField.label} is required.`
          : `${invalidField.label} must be at least ${invalidField.minimum} characters.`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      switch (activeKind) {
        case "exhibition":
          await createExhibition({
            title: values.title.trim(),
            slug: values.slug.trim(),
            startDate: values.startDate,
            ...optionalValues({
              subtitle: values.subtitle,
              description: values.description,
              endDate: values.endDate,
              coverImageUrl: values.coverImageUrl,
            }),
          });
          break;
        case "event":
          await createEvent({
            sectionId: Number(values.sectionId),
            title: values.title.trim(),
            slug: values.slug.trim(),
            ...optionalValues({
              description: values.description,
              eventDate: values.eventDate,
              dateDisplay: values.dateDisplay,
              imageUrl: values.imageUrl,
            }),
          });
          break;
        case "person":
          await createPerson({
            name: values.name.trim(),
            slug: values.slug.trim(),
            ...optionalValues({
              description: values.description,
              birthDate: values.birthDate,
              deathDate: values.deathDate,
            }),
          });
          break;
        case "place":
          await createPlace({
            name: values.name.trim(),
            latitude: Number(values.latitude),
            longitude: Number(values.longitude),
            ...optionalValues({ description: values.description }),
          });
          break;
        case "artifact":
          await createArtifact({
            sectionId: Number(values.sectionId),
            title: values.title.trim(),
            slug: values.slug.trim(),
            artifactType: values.artifactType.trim(),
            ...optionalValues({
              description: values.description,
              historicalContext: values.historicalContext,
              dateDisplay: values.dateDisplay,
            }),
            ...(values.placeId ? { placeId: Number(values.placeId) } : {}),
          });
          break;
        case "story":
          await createStory({
            sectionId: Number(values.sectionId),
            title: values.title.trim(),
            slug: values.slug.trim(),
            content: values.content.trim(),
            ...optionalValues({
              excerpt: values.excerpt,
              coverImageUrl: values.coverImageUrl,
            }),
          });
          break;
      }

      const label = {
        exhibition: "Exhibition created.",
        event: "Event added.",
        person: "Person added.",
        place: "Place added.",
        artifact: "Artifact added.",
        story: "Story added.",
      }[activeKind];
      showToast(label);
      setActiveKind(null);
      setValues(emptyForm);
      await onCreated();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    } finally {
      setSubmitting(false);
    }
  }

  const requiresSection =
    activeKind === "event" ||
    activeKind === "artifact" ||
    activeKind === "story";
  const hasSections = sections !== null && sections.length > 0;
  const needsSection = (kind: CreateContentKind) =>
    kind === "event" || kind === "artifact" || kind === "story";

  return (
    <div>
      <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            aria-expanded={activeKind === action.kind}
            disabled={needsSection(action.kind) && !hasSections}
            onClick={() =>
              activeKind === action.kind
                ? closeForm()
                : openForm(action.kind)
            }
            className={`min-h-20 border-b border-r border-line px-4 py-4 text-left font-sans text-body-s font-medium transition-colors hover:bg-heritage-green/5 disabled:cursor-not-allowed disabled:opacity-45 ${
              activeKind === action.kind
                ? "bg-deep-forest text-ivory hover:bg-deep-forest"
                : "text-ink"
            }`}
          >
            <span className="mr-2 text-ochre" aria-hidden="true">
              {activeKind === action.kind ? "−" : "+"}
            </span>
            {action.label}
          </button>
        ))}
      </div>

      {sectionsError && (
        <p role="status" className="mt-4 font-sans text-body-s text-error">
          Section-based actions are unavailable: {sectionsError}
        </p>
      )}
      {sections !== null && sections.length === 0 && (
        <p className="mt-4 font-sans text-body-s text-muted">
          Add a section to an exhibition before creating events, artifacts, or
          stories.
        </p>
      )}

      {activeKind && (
        <form
          onSubmit={handleSubmit}
          aria-busy={submitting}
          className="border-x border-b border-line bg-white/35 p-5 md:p-7"
        >
          <div className="flex items-start justify-between gap-6 border-b border-line pb-5">
            <div>
              <p className="font-sans text-label uppercase tracking-[0.16em] text-ochre">
                New record
              </p>
              <h3 className="mt-1 font-display text-heading-m">
                {actions.find((action) => action.kind === activeKind)?.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={submitting}
              className="px-2 py-1 font-sans text-body-s text-muted hover:text-ink disabled:opacity-50"
            >
              Close
            </button>
          </div>

          {requiresSection && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Exhibition" name="exhibitionId" required>
                <select
                  name="exhibitionId"
                  value={values.exhibitionId}
                  required
                  onChange={(event) =>
                    updateValue("exhibitionId", event.target.value)
                  }
                  className="h-11 w-full border border-line bg-ivory px-3 font-sans text-body-s text-ink outline-none focus:border-heritage-green"
                >
                  <option value="">Choose an exhibition</option>
                  {(exhibitions ?? []).map((exhibition) => (
                    <option key={exhibition.id} value={exhibition.id}>
                      {exhibition.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Section" name="sectionId" required>
                <select
                  name="sectionId"
                  value={values.sectionId}
                  required
                  disabled={!values.exhibitionId || !selectedSections.length}
                  onChange={(event) =>
                    updateValue("sectionId", event.target.value)
                  }
                  className="h-11 w-full border border-line bg-ivory px-3 font-sans text-body-s text-ink outline-none focus:border-heritage-green disabled:opacity-60"
                >
                  <option value="">
                    {!values.exhibitionId
                      ? "Choose an exhibition first"
                      : selectedSections.length
                        ? "Choose a section"
                        : "No sections available"}
                  </option>
                  {selectedSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </Field>

            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(activeKind === "person" || activeKind === "place") && (
              <Field
                label="Name"
                name="name"
                required
                minLength={2}
                maxLength={activeKind === "person" ? 150 : 255}
                value={values.name}
                onChange={(value) => updateValue("name", value)}
              />
            )}

            {activeKind !== "person" && activeKind !== "place" && (
              <Field
                label="Title"
                name="title"
                required
                minLength={2}
                maxLength={255}
                value={values.title}
                onChange={(value) => updateValue("title", value)}
              />
            )}

            {activeKind !== "place" && (
              <Field
                label="Slug"
                name="slug"
                required
                minLength={2}
                maxLength={activeKind === "person" ? 150 : 255}
                pattern={slugPattern}
                value={values.slug}
                onChange={(value) => updateValue("slug", value)}
              />
            )}

            {activeKind === "exhibition" && (
              <>
                <Field
                  label="Start date"
                  name="startDate"
                  type="date"
                  required
                  value={values.startDate}
                  onChange={(value) => updateValue("startDate", value)}
                />
                <Field
                  label="End date"
                  name="endDate"
                  type="date"
                  value={values.endDate}
                  onChange={(value) => updateValue("endDate", value)}
                />
                <Field
                  label="Subtitle"
                  name="subtitle"
                  value={values.subtitle}
                  onChange={(value) => updateValue("subtitle", value)}
                />
                <Field
                  label="Cover image URL"
                  name="coverImageUrl"
                  type="url"
                  value={values.coverImageUrl}
                  onChange={(value) => updateValue("coverImageUrl", value)}
                />
              </>
            )}

            {activeKind === "event" && (
              <>
                <Field
                  label="Event date"
                  name="eventDate"
                  type="date"
                  value={values.eventDate}
                  onChange={(value) => updateValue("eventDate", value)}
                />
                <Field
                  label="Date display"
                  name="dateDisplay"
                  value={values.dateDisplay}
                  onChange={(value) => updateValue("dateDisplay", value)}
                />
                <Field
                  label="Image URL"
                  name="imageUrl"
                  type="url"
                  value={values.imageUrl}
                  onChange={(value) => updateValue("imageUrl", value)}
                />
              </>
            )}

            {activeKind === "person" && (
              <>
                <Field
                  label="Birth date"
                  name="birthDate"
                  type="date"
                  value={values.birthDate}
                  onChange={(value) => updateValue("birthDate", value)}
                />
                <Field
                  label="Death date"
                  name="deathDate"
                  type="date"
                  value={values.deathDate}
                  onChange={(value) => updateValue("deathDate", value)}
                />
              </>
            )}

            {activeKind === "place" && (
              <>
                <Field
                  label="Latitude"
                  name="latitude"
                  type="number"
                  required
                  min="-90"
                  max="90"
                  step="any"
                  value={values.latitude}
                  onChange={(value) => updateValue("latitude", value)}
                />
                <Field
                  label="Longitude"
                  name="longitude"
                  type="number"
                  required
                  min="-180"
                  max="180"
                  step="any"
                  value={values.longitude}
                  onChange={(value) => updateValue("longitude", value)}
                />
              </>
            )}

            {activeKind === "artifact" && (
              <>
                <Field
                  label="Artifact type"
                  name="artifactType"
                  required
                  minLength={2}
                  maxLength={100}
                  value={values.artifactType}
                  onChange={(value) => updateValue("artifactType", value)}
                />
                <Field
                  label="Date display"
                  name="dateDisplay"
                  value={values.dateDisplay}
                  onChange={(value) => updateValue("dateDisplay", value)}
                />
                <Field label="Place (optional)" name="placeId">
                  <select
                    name="placeId"
                    value={values.placeId}
                    onChange={(event) =>
                      updateValue("placeId", event.target.value)
                    }
                    className="h-11 w-full border border-line bg-ivory px-3 font-sans text-body-s text-ink outline-none focus:border-heritage-green"
                  >
                    <option value="">No place linked</option>
                    {(places ?? []).map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                  {places === null && (
                    <span className="mt-1 block font-sans text-label text-muted">
                      Place options are unavailable.
                    </span>
                  )}
                </Field>
              </>
            )}

            {activeKind === "story" && (
              <>
                <Field
                  label="Cover image URL"
                  name="coverImageUrl"
                  type="url"
                  value={values.coverImageUrl}
                  onChange={(value) => updateValue("coverImageUrl", value)}
                />
                <Field
                  label="Excerpt"
                  name="excerpt"
                  value={values.excerpt}
                  onChange={(value) => updateValue("excerpt", value)}
                />
              </>
            )}

            {activeKind === "exhibition" && (
              <TextAreaField
                label="Description"
                name="description"
                value={values.description}
                onChange={(value) => updateValue("description", value)}
              />
            )}

            {(activeKind === "event" ||
              activeKind === "person" ||
              activeKind === "place" ||
              activeKind === "artifact") && (
              <TextAreaField
                label="Description"
                name="description"
                value={values.description}
                onChange={(value) => updateValue("description", value)}
              />
            )}

            {activeKind === "artifact" && (
              <TextAreaField
                label="Historical context"
                name="historicalContext"
                value={values.historicalContext}
                onChange={(value) =>
                  updateValue("historicalContext", value)
                }
              />
            )}

            {activeKind === "story" && (
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Story content"
                  name="content"
                  required
                  rows={6}
                  value={values.content}
                  onChange={(value) => updateValue("content", value)}
                />
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-5 font-sans text-body-s text-error">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
            <Button
              type="submit"
              disabled={
                submitting ||
                (requiresSection &&
                  (!values.sectionId || selectedSections.length === 0))
              }
            >
              {submitting ? "Creating…" : "Create"}
            </Button>
            <p className="font-sans text-label text-muted">
              Required fields are marked with an asterisk.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
