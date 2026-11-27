import { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
  getApiErrorMessage,
  http,
} from "../../../services/api/client";
import { useAuth } from "../../auth/auth-context";
import { attachImage } from "../api/workspace";
import InlineForm, { type FormField } from "./InlineForm";

type Owner = "person" | "place" | "artifact";

interface AdminPicturesProps {
  owner: Owner;
  id: number;
  name: string;
}


interface Picture {
  attachmentId: number;
  title: string;
  url: string;
  credit: string | null;
  license: string | null;
}

const fields: FormField[] = [
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

async function get<T>(path: string) {
  return (await http.get<{ data: T }>(path)).data.data;
}

interface AdminPicture {
  attachment_id: number;
  title: string;
  file_url: string;
  source_credit: string | null;
  license: string | null;
}

const OWNER_PATHS: Record<Owner, string> = {
  person: "people",
  place: "places",
  artifact: "artifacts",
};

async function loadPictures(owner: Owner, id: number): Promise<Picture[]> {
  const rows = await get<AdminPicture[]>(
    `/admin/${OWNER_PATHS[owner]}/${id}/pictures`,
  );

  return rows.map((row) => ({
    attachmentId: row.attachment_id,
    title: row.title,
    url: row.file_url,
    credit: row.source_credit,
    license: row.license,
  }));
}

export default function AdminPictures({ owner, id, name }: AdminPicturesProps) {
  const { showToast } = useAuth();
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState(
    "We couldn’t load the pictures. You can still add one below.",
  );
  const [reload, setReload] = useState(0);
  const [removing, setRemoving] = useState<Picture | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadPictures(owner, id)
      .then((result) => {
        if (cancelled) return;
        setPictures(result);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(
              error,
              "We couldn’t load the pictures. You can still add one below.",
            ),
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, id, reload]);

  async function addPicture(values: Record<string, string>) {
    if (!values.imageUrl) throw new Error("Choose a picture first.");

    await attachImage(values, name, { [`${owner}Id`]: id });
    showToast("Picture added.");
    setReload((count) => count + 1);
  }

  async function removePicture() {
    if (!removing) return;
    setBusy(true);

    try {
      await http.delete(`/media-attachment/${removing.attachmentId}`);
      showToast("Picture removed.");
      setReload((count) => count + 1);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not remove the picture.",
        "error",
      );
    } finally {
      setBusy(false);
      setRemoving(null);
    }
  }

  return (
    <section className="border border-line p-5">
      <h2 className="font-display text-heading-s">Pictures</h2>

      {status === "loading" && (
        <p role="status" className="mt-3 font-sans text-body-s text-muted">
          Loading pictures…
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="mt-3 font-sans text-body-s text-error">
          {loadError}
        </p>
      )}

      {status === "ready" && pictures.length === 0 && (
        <p className="mt-3 font-sans text-body-s text-muted">
          No picture yet.
        </p>
      )}

      {pictures.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {pictures.map((picture) => (
            <li key={picture.attachmentId} className="flex gap-4 py-4">
              <img
                src={picture.url}
                alt={picture.title}
                className="h-24 w-24 shrink-0 bg-sand/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-body-s text-ink">
                  {picture.title}
                </p>
                {picture.credit && (
                  <p className="mt-1 font-sans text-meta text-muted">
                    Credit: {picture.credit}
                  </p>
                )}
                {picture.license && (
                  <p className="font-sans text-meta text-muted">
                    License: {picture.license}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setRemoving(picture)}
                  className="mt-2 font-sans text-meta text-error underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-6 font-sans text-label font-medium uppercase tracking-widest text-muted">
        Add a picture
      </h3>
      <div className="mt-3">
        <InlineForm
          submitLabel="Add picture"
          fields={fields}
          onSubmit={addPicture}
        />
      </div>

      {removing && (
        <ConfirmDialog
          title="Remove this picture?"
          message="It will no longer show on the site. You can add another one afterwards."
          confirmLabel="Remove picture"
          danger
          busy={busy}
          onConfirm={removePicture}
          onCancel={() => setRemoving(null)}
        />
      )}
    </section>
  );
}

export function AdminPicturesToggle(props: AdminPicturesProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-sans text-meta underline underline-offset-4 hover:text-heritage-green"
      >
        {open ? "Close pictures" : "Pictures"}
      </button>
      {open && (
        <div className="mt-3">
          <AdminPictures {...props} />
        </div>
      )}
    </div>
  );
}
