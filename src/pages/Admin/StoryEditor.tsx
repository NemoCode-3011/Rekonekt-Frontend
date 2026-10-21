import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteAdminStory,
  getAdminStory,
  setStoryPublished,
  updateAdminStory,
  type AdminStory,
} from "../../features/admin/api/stories";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import StoryConnection from "../../features/admin/components/StoryConnection";
import { storyFields } from "../../features/admin/components/StoryFields";
import { useAuth } from "../../features/auth/auth-context";
import { ApiError } from "../../services/api/client";

export default function AdminStoryEditor() {
  const { id } = useParams<{ id: string }>();
  const storyId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [story, setStory] = useState<AdminStory | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStory(await getAdminStory(storyId));
      setStatus("ready");
    } catch (error) {
      setStatus(error instanceof ApiError && error.status === 404 ? "missing" : "error");
    }
  }, [storyId]);

  useEffect(() => {
    load();
  }, [load]);

  const back = (
    <Link to="/admin/stories" className="font-sans text-body-s text-muted hover:text-ink">
      ← All stories
    </Link>
  );

  if (status !== "ready" || !story) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
        {back}
        <p
          className="mt-8 font-sans text-body-m text-muted"
          role={status === "loading" ? undefined : "alert"}
        >
          {status === "loading" && "Loading the story…"}
          {status === "missing" && "That story doesn’t exist. It may have been deleted."}
          {status === "error" && "We couldn’t load this story. Refresh to try again."}
        </p>
      </div>
    );
  }

  const published = story.status === "published";
  const readyForHome = Boolean(story.did_you_know?.trim() && story.cover_image_url);

  async function togglePublished() {
    if (!story) return;
    setBusy(true);
    try {
      await setStoryPublished(story.id, !published);
      showToast(published ? "Story moved back to draft." : "Story published.");
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not change the status.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!story) return;
    if (!window.confirm("Delete this story? This can't be undone.")) return;

    setBusy(true);
    try {
      await deleteAdminStory(story.id);
      showToast("Story deleted.");
      navigate("/admin/stories");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete the story.", "error");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-12">
      {back}

      <div className="mt-4">
        <AdminPageHeader
          title={story.title}
          description={
            published
              ? "Published. Visitors can read this story."
              : "Draft. Only admins can see this story."
          }
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <InlineForm
          submitLabel="Save changes"
          keepValues
          fields={storyFields(story)}
          onSubmit={async (values) => {
            await updateAdminStory(story.id, values);
            showToast("Story saved.");
            await load();
          }}
        />

        <aside className="space-y-6">
          <section className="border border-line p-5">
            <h2 className="font-display text-heading-s">Status</h2>
            <p className="mt-2 font-sans text-body-s capitalize text-muted">{story.status}</p>

            <button
              type="button"
              onClick={togglePublished}
              disabled={busy}
              className="mt-4 h-11 w-full bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest disabled:opacity-60"
            >
              {published ? "Move back to draft" : "Publish"}
            </button>

            {published && (
              <Link
                to={`/stories/${story.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block font-sans text-body-s text-heritage-green underline underline-offset-4"
              >
                View on the site
              </Link>
            )}

            <p className="mt-4 font-sans text-meta text-muted">
              {readyForHome
                ? "This story can appear in “Did you know?” on the home page once it is published."
                : "Add a “Did you know?” line and a cover image to make this story eligible for the home page."}
            </p>
          </section>

          <StoryConnection story={story} onChanged={load} />

          <section className="border border-line p-5">
            <h2 className="font-display text-heading-s">Delete</h2>
            <p className="mt-2 font-sans text-body-s text-muted">Removes the story for good.</p>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="mt-4 h-11 border border-error px-6 font-sans text-body-s font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-60"
            >
              Delete story
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}