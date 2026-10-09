import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { formatLongDate } from "../../lib/dates";
import { createNote, deleteNote, getNotes, updateNote, type Note } from "./api";

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

// A floating button that opens a panel for quick personal notes.
export default function NotesWidget() {
  const { user, showToast } = useAuth();
  const location = useLocation();
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [loadedFor, setLoadedFor] = useState<number | null>(null);

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load the notes the first time the panel opens for a signed-in visitor.
  useEffect(() => {
    if (!open || !userId || loadedFor === userId) return;

    setStatus("loading");

    getNotes()
      .then((data) => {
        setNotes(data);
        setLoadedFor(userId);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [open, userId, loadedFor]);

  // Esc closes the panel. The writing box is focused when it opens.
  useEffect(() => {
    if (!open) return;

    textareaRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, userId]);

  function resetForm() {
    setText("");
    setEditingId(null);
  }

  async function save() {
    const content = text.trim();

    if (content.length < 2) {
      showToast("Write a little more before saving.", "error");
      return;
    }

    // The first line of the note becomes its title.
    const title = content.split("\n")[0].slice(0, 60);

    setSaving(true);

    try {
      if (editingId === null) {
        const created = await createNote({ title, content, noteDate: today() });
        setNotes((current) => [created, ...current]);
        showToast("Note saved.");
      } else {
        const updated = await updateNote(editingId, { title, content });
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

  async function remove(note: Note) {
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

  function startEditing(note: Note) {
    setEditingId(note.id);
    setText(note.content);
    textareaRef.current?.focus();
  }

  const ready = status === "ready" && loadedFor === userId;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open notes"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-heritage-green text-ivory shadow-lg ring-1 ring-ivory/30 transition-colors hover:bg-deep-forest"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notes"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] cursor-default bg-ink/40"
          />

          <aside
            role="dialog"
            aria-label="Notes"
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-ivory text-ink shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-heading-s">Your notes</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notes"
                className="text-2xl leading-none text-muted hover:text-ink"
              >
                ×
              </button>
            </div>

            {!user ? (
              <div className="px-6 py-8">
                <p className="font-display text-heading-s leading-tight">
                  Keep your thoughts as you explore.
                </p>
                <p className="mt-3 font-sans text-body-m text-muted">
                  Sign in to write notes and find them again on your next visit.
                </p>
                <Link
                  to="/auth/login"
                  state={{ from: location.pathname + location.search }}
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex h-12 items-center bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-5">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        (event.metaKey || event.ctrlKey) &&
                        event.key === "Enter"
                      ) {
                        save();
                      }
                    }}
                    rows={5}
                    placeholder="Write a note…"
                    aria-label="Write a note"
                    className="w-full resize-none border border-line bg-transparent px-4 py-3 font-sans text-body-m outline-none transition-colors focus:border-heritage-green"
                  />

                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest disabled:opacity-60"
                    >
                      {saving
                        ? "Saving…"
                        : editingId === null
                          ? "Save note"
                          : "Save changes"}
                    </button>

                    {editingId !== null && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="font-sans text-body-s text-muted underline underline-offset-4 hover:text-ink"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {status === "loading" && (
                    <p className="py-6 font-sans text-body-s text-muted">
                      Loading your notes…
                    </p>
                  )}

                  {status === "error" && (
                    <p
                      role="alert"
                      className="py-6 font-sans text-body-s text-muted"
                    >
                      We couldn't load your notes. Close this panel and try
                      again.
                    </p>
                  )}

                  {ready && notes.length === 0 && (
                    <p className="py-6 font-sans text-body-m text-muted">
                      No notes yet. Anything you write above is saved here.
                    </p>
                  )}

                  {ready && notes.length > 0 && (
                    <ul className="divide-y divide-line">
                      {notes.map((note) => (
                        <li key={note.id} className="py-5">
                          <p className="font-sans text-meta uppercase tracking-widest text-ochre">
                            {formatLongDate(note.note_date ?? note.created_at)}
                          </p>
                          <p className="mt-2 whitespace-pre-line font-sans text-body-m">
                            {note.content}
                          </p>
                          <div className="mt-3 flex gap-5 font-sans text-body-s">
                            <button
                              type="button"
                              onClick={() => startEditing(note)}
                              className="underline underline-offset-4 hover:text-heritage-green"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(note)}
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
              </>
            )}
          </aside>
        </>
      )}
    </>
  );
}
