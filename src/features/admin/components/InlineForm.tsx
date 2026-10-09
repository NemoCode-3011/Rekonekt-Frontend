import { useEffect, useState, type FormEvent } from "react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../auth/auth-context";
import {
  uploadAdminImage,
  type UploadedMedia,
} from "../api/media";

export interface FormField {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "date" | "select" | "email" | "password" | "image";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  initial?: string;
}

interface InlineFormProps {
  fields: FormField[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  keepValues?: boolean; // keep what was typed after saving (for edit forms)
}

const controlClass =
  "w-full border border-line bg-transparent px-3 py-2.5 font-sans text-body-s outline-none transition-colors focus:border-heritage-green";

// A small form driven by a list of fields. It checks required fields,
// shows errors, and disables the button while saving.
export default function InlineForm({
  fields,
  submitLabel,
  onSubmit,
  onCancel,
  keepValues,
}: InlineFormProps) {
  const { showToast } = useAuth();

  const start = () =>
    Object.fromEntries(
      fields.map((field) => [field.name, field.initial ?? ""]),
    );

  const [values, setValues] = useState<Record<string, string>>(start);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [imageValidationErrors, setImageValidationErrors] = useState<
    Record<string, string>
  >({});
  const [uploadedMedia, setUploadedMedia] = useState<
    Record<string, UploadedMedia>
  >({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  useEffect(
    () => () => {
      Object.values(previews).forEach((preview) => URL.revokeObjectURL(preview));
    },
    [previews],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.name].trim()) {
        found[field.name] = `${field.label} is required.`;
      }
    }
    Object.assign(found, imageValidationErrors);

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);

    try {
      const submitted = { ...values };
      for (const field of fields.filter((candidate) => candidate.kind === "image")) {
        const cachedMedia = uploadedMedia[field.name];
        if (cachedMedia) {
          submitted[field.name] = cachedMedia.file_url;
          submitted.imageMediaId = String(cachedMedia.id);
          continue;
        }

        const file = files[field.name];
        if (!file) continue;

        const title =
          submitted.title?.trim() ||
          submitted.name?.trim() ||
          `${field.label} image`;

        try {
          const media = await uploadAdminImage(
            file,
            {
              title: `${title} image`,
              mediaType: "image",
              description: submitted.description,
              sourceCredit: submitted.imageCredit,
              license: submitted.imageLicense,
            },
            (progress) =>
              setUploadProgress((current) => ({
                ...current,
                [field.name]: progress,
              })),
          );
          setUploadedMedia((current) => ({
            ...current,
            [field.name]: media,
          }));
          submitted[field.name] = media.file_url;
          submitted.imageMediaId = String(media.id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Image upload failed.";
          setErrors((current) => ({ ...current, [field.name]: message }));
          throw error;
        }
      }

      await onSubmit(submitted);
      if (!keepValues) {
        setValues(start());
        setFiles({});
        setImageValidationErrors({});
        setUploadedMedia({});
        setPreviews({});
        setUploadProgress({});
      }
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 bg-sand/20 p-5"
    >
      {fields.map((field) => {
        const id = `field-${field.name}`;
        const common = {
          id,
          value: values[field.name],
          placeholder: field.placeholder,
          "aria-invalid": !!errors[field.name],
          className: `${controlClass} ${errors[field.name] ? "border-error" : ""}`,
        };
        const change = (value: string) =>
          setValues((current) => ({ ...current, [field.name]: value }));

        return (
          <div key={field.name}>
            <label
              htmlFor={id}
              className="mb-1.5 block font-sans text-label font-medium uppercase tracking-widest text-muted"
            >
              {field.label}
              {field.required && " *"}
            </label>

            {field.kind === "textarea" ? (
              <textarea
                {...common}
                rows={3}
                onChange={(event) => change(event.target.value)}
              />
            ) : field.kind === "select" ? (
              <select
                {...common}
                onChange={(event) => change(event.target.value)}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.kind === "image" ? (
              <div>
                <input
                  id={id}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={!!errors[field.name]}
                  className="block w-full border border-line bg-transparent px-3 py-2 font-sans text-body-s file:mr-4 file:border-0 file:bg-heritage-green file:px-3 file:py-2 file:font-sans file:text-body-s file:text-ivory"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    const allowed = ["image/jpeg", "image/png", "image/webp"];
                    if (!allowed.includes(file.type)) {
                      const oldPreview = previews[field.name];
                      if (oldPreview) URL.revokeObjectURL(oldPreview);
                      setFiles((current) => {
                        const next = { ...current };
                        delete next[field.name];
                        return next;
                      });
                      setUploadedMedia((current) => {
                        const next = { ...current };
                        delete next[field.name];
                        return next;
                      });
                      setPreviews((current) => ({
                        ...current,
                        [field.name]: "",
                      }));
                      setErrors((current) => ({
                        ...current,
                        [field.name]: "Choose a JPEG, PNG, or WebP image.",
                      }));
                      setImageValidationErrors((current) => ({
                        ...current,
                        [field.name]: "Choose a JPEG, PNG, or WebP image.",
                      }));
                      event.target.value = "";
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      const oldPreview = previews[field.name];
                      if (oldPreview) URL.revokeObjectURL(oldPreview);
                      setFiles((current) => {
                        const next = { ...current };
                        delete next[field.name];
                        return next;
                      });
                      setUploadedMedia((current) => {
                        const next = { ...current };
                        delete next[field.name];
                        return next;
                      });
                      setPreviews((current) => ({
                        ...current,
                        [field.name]: "",
                      }));
                      setErrors((current) => ({
                        ...current,
                        [field.name]: "Images must be 10 MB or smaller.",
                      }));
                      setImageValidationErrors((current) => ({
                        ...current,
                        [field.name]: "Images must be 10 MB or smaller.",
                      }));
                      event.target.value = "";
                      return;
                    }

                    const oldPreview = previews[field.name];
                    if (oldPreview) URL.revokeObjectURL(oldPreview);
                    setFiles((current) => ({ ...current, [field.name]: file }));
                    setUploadedMedia((current) => {
                      const next = { ...current };
                      delete next[field.name];
                      return next;
                    });
                    setPreviews((current) => ({
                      ...current,
                      [field.name]: URL.createObjectURL(file),
                    }));
                    setErrors((current) => ({ ...current, [field.name]: "" }));
                    setImageValidationErrors((current) => {
                      const next = { ...current };
                      delete next[field.name];
                      return next;
                    });
                  }}
                />
                {(previews[field.name] || values[field.name]) && (
                  <img
                    src={previews[field.name] || values[field.name]}
                    alt={`${field.label} preview`}
                    className="mt-3 max-h-48 w-auto max-w-full object-contain"
                  />
                )}
                {uploadProgress[field.name] !== undefined && saving && (
                  <p role="status" className="mt-2 font-sans text-meta text-muted">
                    Uploading image… {uploadProgress[field.name]}%
                  </p>
                )}
                <p className="mt-1.5 font-sans text-meta text-muted">
                  JPEG, PNG, or WebP. Maximum 10 MB.
                </p>
              </div>
            ) : (
              <input
                {...common}
                type={field.kind ?? "text"}
                onChange={(event) => change(event.target.value)}
              />
            )}

            {errors[field.name] ? (
              <p className="mt-1.5 font-sans text-body-s text-error">
                {errors[field.name]}
              </p>
            ) : (
              field.hint && (
                <p className="mt-1.5 font-sans text-meta text-muted">
                  {field.hint}
                </p>
              )
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-4 pt-1">
        <Button type="submit" disabled={saving} className="h-11">
          {saving ? "Saving…" : submitLabel}
        </Button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-body-s text-muted underline underline-offset-4 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
