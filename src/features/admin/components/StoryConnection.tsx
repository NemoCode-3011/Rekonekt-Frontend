import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../auth/auth-context";
import { getAdminExhibitions, getAdminSections } from "../api/dashboard";
import { connectStory, type AdminStory } from "../api/stories";
import type { DashboardExhibitionResponseItem, DashboardSection } from "../types/dashboard";

const selectClass =
  "w-full border border-line bg-transparent px-3 py-2.5 font-sans text-body-s outline-none transition-colors focus:border-heritage-green disabled:opacity-50";

const labelClass =
  "mb-1.5 block font-sans text-label font-medium uppercase tracking-widest text-muted";

interface StoryConnectionProps {
  story: AdminStory;
  /** Called after the connection has changed, so the page can reload the story. */
  onChanged: () => Promise<void>;
}

// Lets an editor connect a story to a chapter of an exhibition, or leave it
// standalone. Most stories (myths, folklore...) never need an exhibition.
export default function StoryConnection({ story, onChanged }: StoryConnectionProps) {
  const { showToast } = useAuth();

  const [exhibitions, setExhibitions] = useState<DashboardExhibitionResponseItem[]>([]);
  const [chapters, setChapters] = useState<DashboardSection[]>([]);
  const [exhibitionId, setExhibitionId] = useState(
    story.exhibition_id ? String(story.exhibition_id) : "",
  );
  const [sectionId, setSectionId] = useState(story.section_id ? String(story.section_id) : "");
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminExhibitions()
      .then((result) => setExhibitions(result.exhibitions))
      .catch(() => setLoadFailed(true));
  }, []);

  // Load the chapters of whichever exhibition is chosen.
  useEffect(() => {
    if (!exhibitionId) return;
    let cancelled = false;

    getAdminSections(Number(exhibitionId))
      .then((result) => {
        if (!cancelled) setChapters([...result].sort((a, b) => a.section_order - b.section_order));
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [exhibitionId]);

  const chosen = exhibitions.find((exhibition) => String(exhibition.id) === exhibitionId);
  const connected = story.section_id !== null;

  // What pressing the button would do.
  const wantsDisconnect = exhibitionId === "" && connected;
  const wantsConnect =
    exhibitionId !== "" && sectionId !== "" && Number(sectionId) !== story.section_id;

  async function save() {
    setSaving(true);
    try {
      await connectStory(story.id, wantsDisconnect ? null : Number(sectionId));
      showToast(wantsDisconnect ? "Story is now standalone." : "Story connected.");
      await onChanged();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save the connection.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-line p-5">
      <h2 className="font-display text-heading-s">Exhibition</h2>

      <p className="mt-2 font-sans text-body-s text-muted">
        {connected
          ? `Connected to ${story.exhibition_title}, chapter “${story.section_title}”.`
          : "Standalone. This story belongs to no exhibition, which is right for most myths and folklore."}
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="story-exhibition" className={labelClass}>
            Connect to an exhibition
          </label>
          <select
            id="story-exhibition"
            className={selectClass}
            value={exhibitionId}
            onChange={(event) => {
              setExhibitionId(event.target.value);
              setSectionId("");
              setChapters([]);
            }}
          >
            <option value="">None (standalone)</option>
            {exhibitions.map((exhibition) => (
              <option key={exhibition.id} value={exhibition.id}>
                {exhibition.title}
              </option>
            ))}
          </select>
        </div>

        {exhibitionId !== "" && (
          <div>
            <label htmlFor="story-chapter" className={labelClass}>
              Chapter
            </label>
            <select
              id="story-chapter"
              className={selectClass}
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              disabled={chapters.length === 0}
            >
              <option value="">
                {chapters.length === 0 ? "No chapters yet" : "Choose a chapter"}
              </option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.section_order}. {chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {chosen && chosen.status !== "published" && (
        <p className="mt-4 font-sans text-meta text-muted">
          This exhibition isn&rsquo;t published yet, so visitors won&rsquo;t see the story until it
          is.
        </p>
      )}

      {loadFailed && (
        <p role="alert" className="mt-4 font-sans text-meta text-error">
          Couldn&rsquo;t load the exhibitions. Refresh the page to try again.
        </p>
      )}

      {(wantsConnect || wantsDisconnect) && (
        <Button type="button" onClick={save} disabled={saving} className="mt-5 h-11">
          {saving ? "Saving…" : wantsDisconnect ? "Make standalone" : "Connect story"}
        </Button>
      )}
    </section>
  );
}