import { useState, type FormEvent } from "react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../auth/auth-context";

export interface FormField {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "date" | "select" | "email" | "password";
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.name].trim()) {
        found[field.name] = `${field.label} is required.`;
      }
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);

    try {
      await onSubmit(values);
      if (!keepValues) setValues(start());
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
