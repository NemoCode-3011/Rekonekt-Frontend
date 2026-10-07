import { useEffect, useState, type FormEvent } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../features/auth/auth-context";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
  type Note,
} from "../../features/notes/api";
import { formatLongDate } from "../../lib/dates";

// Today as YYYY-MM-DD in the visitor's own timezone.
function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function Notes() {
  const { showToast } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  // The form is used for both adding and editing.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteDate, setNoteDate] = useState(today());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotes()
      .then((data) => {
        setNotes(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setNoteDate(today());
    setErrors({});
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setTitle(note.title ?? "");
    setContent(note.content);
    setNoteDate(note.note_date ? note.note_date.slice(0, 10) : today());
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (title.trim().length < 2) found.title = "Give your note a short title.";
    if (!content.trim()) found.content = "Write something in your note.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);

    const input = {
      title: title.trim(),
      content: content.trim(),
      noteDate,
    };

    try {
      if (editingId === null) {
        const created = await createNote(input);
        setNotes((current) => [created, ...current]);
        showToast("Note added.");
      } else {
        const updated = await updateNote(editingId, input);
        setNotes((current) =>
          current.map((note) => (note.id === editingId ? updated : note)),
        );
        showToast("Note updated.");
      }

      resetForm();
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(note: Note) {
    if (!window.confirm("Delete this note? This can't be undone.")) return;

    try {
      await deleteNote(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (editingId === note.id) resetForm();
      showToast("Note deleted.");
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  return (
    <div className="grid gap-16 lg:grid-cols-[24rem_1fr] lg:gap-24">
      {/* Add / edit */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 lg:sticky lg:top-28 lg:self-start"
        noValidate
      >
        <h2 className="font-display text-heading-s">
          {editingId === null ? "Add a note" : "Edit note"}
        </h2>

        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title}
        />

        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-label font-medium uppercase tracking-widest text-muted"
          >
            Note
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            aria-invalid={!!errors.content}
            className={`w-full border bg-transparent px-4 py-3 text-body-m outline-none transition-colors focus:border-heritage-green ${
              errors.content ? "border-error" : "border-line"
            }`}
          />
          {errors.content && (
            <p className="mt-2 text-body-s text-error">{errors.content}</p>
          )}
        </div>

        <Input
          label="Date"
          name="date"
          type="date"
          value={noteDate}
          onChange={(event) => setNoteDate(event.target.value)}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId === null ? "Add note" : "Save note"}
          </Button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="font-sans text-body-m text-muted underline underline-offset-4 hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Your notes */}
      <div>
        {status === "loading" && (
          <p className="font-sans text-body-s text-muted">
            Loading your notes…
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="font-sans text-body-m text-muted">
            We couldn't load your notes. Refresh to try again.
          </p>
        )}

        {status === "ready" && notes.length === 0 && (
          <div>
            <p className="max-w-md font-display text-heading-m leading-tight">
              No notes yet.
            </p>
            <p className="mt-3 max-w-md font-sans text-body-m text-muted">
              Use notes to keep track of questions, ideas and things you want to
              look up later.
            </p>
          </div>
        )}

        {status === "ready" && notes.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {notes.map((note) => (
              <li key={note.id} className="py-7">
                <p className="font-display text-heading-s text-ochre">
                  {formatLongDate(note.note_date ?? note.created_at)}
                </p>
                <h3 className="mt-1 font-display text-heading-m leading-tight">
                  {note.title}
                </h3>
                <p className="mt-3 max-w-2xl whitespace-pre-line font-sans text-body-m text-muted">
                  {note.content}
                </p>

                <div className="mt-5 flex gap-6 font-sans text-body-s">
                  <button
                    type="button"
                    onClick={() => startEditing(note)}
                    className="underline underline-offset-4 hover:text-heritage-green"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note)}
                    className="text-muted underline underline-offset-4 hover:text-error"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notes;
