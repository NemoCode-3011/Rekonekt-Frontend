import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteAdminWonder,
  getAdminWonder,
  setWonderPublished,
  updateAdminWonder,
  type AdminWonder,
} from "../../features/admin/api/wonders";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import { wonderFields } from "../../features/admin/components/WonderFields";
import { useAuth } from "../../features/auth/auth-context";
import { ApiError, getApiErrorMessage } from "../../services/api/client";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageLoader from "../../components/ui/PageLoader";
import PageError from "../../components/ui/PageError";
import { useGuardedLink } from "../../features/admin/unsaved/unsaved-context";

export default function AdminWonderEditor() {
  const { id } = useParams<{ id: string }>();
  const wonderId = Number(id);
  const navigate = useNavigate();
  const guardedLink = useGuardedLink();
  const { showToast } = useAuth();

  const [wonder, setWonder] = useState<AdminWonder | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "missing" | "error"
  >("loading");
  const [loadError, setLoadError] = useState("We couldn't load this wonder.");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setWonder(await getAdminWonder(wonderId));
      setStatus("ready");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setStatus("missing");
      } else {
        setLoadError(getApiErrorMessage(error, "We couldn't load this wonder."));
        setStatus("error");
      }
    }
  }, [wonderId]);

  useEffect(() => {
    let cancelled = false;

    getAdminWonder(wonderId)
      .then((result) => {
        if (cancelled) return;
        setWonder(result);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setStatus("missing");
        } else {
          setLoadError(getApiErrorMessage(error, "We couldn't load this wonder."));
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [wonderId]);

  const back = (
    <Link
      to="/admin/wonders"
      onClick={guardedLink("/admin/wonders")}
      className="font-sans text-body-s text-muted hover:text-ink"
    >
      ← All wonders
    </Link>
  );

  if (status !== "ready" || !wonder) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
        {back}
        {status === "loading" && <PageLoader label="Loading the wonder…" />}

        {status === "error" && (
          <PageError
            message={loadError}
            backTo="/admin/wonders"
            backLabel="Back to wonders"
          />
        )}

        {status === "missing" && (
          <p role="alert" className="mt-8 font-sans text-body-m text-muted">
            That wonder doesn’t exist. It may have been deleted.
          </p>
        )}
      </div>
    );
  }

  const published = wonder.status === "published";
  const hasStory = Boolean(wonder.content?.trim());

  async function togglePublished() {
    if (!wonder) return;
    setBusy(true);
    try {
      await setWonderPublished(wonder.id, !published);
      showToast(
        published ? "Wonder moved back to draft." : "Wonder published.",
      );
      await load();
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Could not change the status."),
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!wonder) return;

    setBusy(true);
    try {
      await deleteAdminWonder(wonder.id);
      showToast("Wonder deleted.");
      navigate("/admin/wonders");
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Could not delete the wonder."),
        "error",
      );
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-12">
      {back}

      <div className="mt-4">
        <AdminPageHeader
          title={wonder.title}
          description={
            published
              ? "Published. Visitors can see this wonder."
              : "Draft. Only admins can see this wonder."
          }
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <InlineForm
          submitLabel="Save changes"
          keepValues
          fields={wonderFields(wonder)}
          onSubmit={async (values) => {
            await updateAdminWonder(wonder.id, values);
            showToast("Wonder saved.");
            await load();
          }}
        />

        <aside className="space-y-6">
          <section className="border border-line p-5">
            <h2 className="font-display text-heading-s">Status</h2>
            <p className="mt-2 font-sans text-body-s capitalize text-muted">
              {wonder.status}
            </p>

            <button
              type="button"
              onClick={togglePublished}
              disabled={busy || (!published && !hasStory)}
              className="mt-4 h-11 w-full bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest disabled:opacity-60"
            >
              {published ? "Move back to draft" : "Publish"}
            </button>

            {!published && !hasStory && (
              <p className="mt-3 font-sans text-meta text-muted">
                Write and save “About this wonder” before publishing.
              </p>
            )}

            {published && (
              <Link
                to={`/wonders/${wonder.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block font-sans text-body-s text-heritage-green underline underline-offset-4"
              >
                View on the site
              </Link>
            )}

            <p className="mt-4 font-sans text-meta text-muted">
              Changes are saved with “Save changes”. Publishing and moving back
              to draft take effect straight away.
            </p>
          </section>

          <section className="border border-line p-5">
            <h2 className="font-display text-heading-s">Delete</h2>
            <p className="mt-2 font-sans text-body-s text-muted">
              Removes the wonder and its links for good.
            </p>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
              className="mt-4 h-11 border border-error px-6 font-sans text-body-s font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-60"
            >
              Delete wonder
            </button>
          </section>
        </aside>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this wonder?"
          message="This removes the wonder and its links for good. It can't be undone."
          confirmLabel="Delete wonder"
          danger
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}