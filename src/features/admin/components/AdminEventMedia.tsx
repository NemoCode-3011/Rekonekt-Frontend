import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  attachAdminMediaToEvent,
  createAdminYouTubeMedia,
  getAdminEventMedia,
  removeAdminEventMedia,
  uploadAdminVideo,
  type AdminEventMedia as AdminEventMediaRecord,
  type AdminMediaMetadata,
  type AdminMediaRecord,
} from "../api/media";
import { useAuth } from "../../auth/auth-context";
import { useUnsavedChanges } from "../unsaved/unsaved-context";

type VideoMode = "upload" | "youtube" | null;
type MetadataValues = Omit<AdminMediaMetadata, "title"> & { title: string };

const emptyMetadata: MetadataValues = {
  title: "",
  caption: "",
  description: "",
  sourceCredit: "",
  license: "",
};

const fieldClass =
  "w-full border border-line bg-ivory px-3 py-2.5 font-sans text-body-s text-ink outline-none transition-colors focus:border-heritage-green";
const labelClass =
  "mb-1.5 block font-sans text-label font-medium uppercase tracking-widest text-muted";
const metadataFields = [
  { name: "caption", label: "Caption", multiline: true },
  { name: "description", label: "Description", multiline: true },
  { name: "sourceCredit", label: "Source credit" },
  { name: "license", label: "License" },
] as const;

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Could not save this video.";
}

function normalizedMetadata(values: MetadataValues): AdminMediaMetadata {
  const optional = (value: string | undefined) => value?.trim() || undefined;
  return {
    title: values.title.trim(),
    caption: optional(values.caption),
    description: optional(values.description),
    sourceCredit: optional(values.sourceCredit),
    license: optional(values.license),
  };
}

function VideoPreview({ media }: { media: AdminMediaRecord }) {
  if (media.video_provider === "youtube") {
    return media.embed_url ? (
      <iframe
        src={media.embed_url}
        title={media.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="aspect-video w-full bg-ink"
      />
    ) : (
      <p role="alert" className="bg-ink p-4 font-sans text-body-s text-ivory">
        This YouTube video does not have an available embed preview.
      </p>
    );
  }

  return (
    <video
      controls
      preload="metadata"
      src={media.file_url}
      className="aspect-video w-full bg-ink"
    />
  );
}

export default function AdminEventMedia({ eventId }: { eventId: number }) {
  const { showToast } = useAuth();
  const [media, setMedia] = useState<AdminEventMediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<VideoMode>(null);
  const [metadata, setMetadata] = useState<MetadataValues>(emptyMetadata);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pendingMedia, setPendingMedia] = useState<AdminMediaRecord | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(
    pendingMedia !== null ||
      file !== null ||
      youtubeUrl.trim() !== "" ||
      Object.values(metadata).some((value) => value.trim() !== ""),
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setMedia(await getAdminEventMedia(eventId));
      setLoadError(null);
    } catch (error) {
      setLoadError(messageOf(error));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    getAdminEventMedia(eventId)
      .then((result) => {
        if (cancelled) return;
        setMedia(result);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(messageOf(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const videos = media.filter((item) => item.media_type === "video");

  function updateMetadata(field: keyof MetadataValues, value: string) {
    setMetadata((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setMode(null);
    setMetadata(emptyMetadata);
    setYoutubeUrl("");
    setFile(null);
    setFileError(null);
    setUploadProgress(null);
    setSubmitError(null);
  }

  async function attachCreatedMedia(created: AdminMediaRecord) {
    setPendingMedia(created);
    setSaving(true);
    setSubmitError(null);
    try {
      await attachAdminMediaToEvent(created.id, eventId, media.length);
      setPendingMedia(null);
      resetForm();
      showToast("Video added to event.");
      await refresh();
    } catch (error) {
      setSubmitError(
        `The video was saved, but could not be attached to this event. Retry the attachment. ${messageOf(error)}`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitYouTube(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (metadata.title.trim().length < 2) {
      setSubmitError("Title must be at least 2 characters.");
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const created = await createAdminYouTubeMedia({
        ...normalizedMetadata(metadata),
        youtubeUrl: youtubeUrl.trim(),
      });
      await attachCreatedMedia(created);
    } catch (error) {
      setSubmitError(messageOf(error));
    } finally {
      setSaving(false);
    }
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setFileError("Choose an MP4 or WebM video file.");
      return;
    }
    if (metadata.title.trim().length < 2) {
      setSubmitError("Title must be at least 2 characters.");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    setUploadProgress(0);
    try {
      const created = await uploadAdminVideo(
        file,
        normalizedMetadata(metadata),
        setUploadProgress,
      );
      await attachCreatedMedia(created);
    } catch (error) {
      setSubmitError(messageOf(error));
    } finally {
      setSaving(false);
    }
  }

  async function retryAttach() {
    if (pendingMedia) await attachCreatedMedia(pendingMedia);
  }

  async function removeVideo(attachmentId: number) {
    setSaving(true);
    try {
      await removeAdminEventMedia(attachmentId);
      await refresh();
      showToast("Video removed from event.");
    } catch (error) {
      showToast(messageOf(error), "error");
    } finally {
      setSaving(false);
    }
  }

  function chooseFile(selected: File | undefined) {
    setFileError(null);
    setFile(selected ?? null);
    setUploadProgress(null);
    if (!selected) return;

    const supportedType = ["video/mp4", "video/webm"].includes(selected.type);
    const supportedExtension = /\.(mp4|webm)$/i.test(selected.name);
    if (!supportedType || !supportedExtension) {
      setFile(null);
      setFileError("Choose an MP4 or WebM video file.");
    } else if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setFileError("Video files must be 10 MB or smaller.");
    }
  }

  function renderMetadataFields() {
    return (
      <>
        <label className="block">
          <span className={labelClass}>Title *</span>
          <input
            required
            minLength={2}
            maxLength={255}
            value={metadata.title}
            onChange={(event) => updateMetadata("title", event.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {metadataFields.map((field) => (
            <label key={field.name} className="block">
              <span className={labelClass}>{field.label}</span>
              {"multiline" in field && field.multiline ? (
                <textarea
                  rows={3}
                  value={metadata[field.name] ?? ""}
                  onChange={(event) =>
                    updateMetadata(field.name, event.target.value)
                  }
                  className={fieldClass}
                />
              ) : (
                <input
                  maxLength={255}
                  value={metadata[field.name] ?? ""}
                  onChange={(event) =>
                    updateMetadata(field.name, event.target.value)
                  }
                  className={fieldClass}
                />
              )}
            </label>
          ))}
        </div>
      </>
    );
  }

  return (
    <section className="border border-line p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-heading-s">Videos</h2>
          <p className="mt-2 font-sans text-body-s text-muted">
            Upload a short video or add a YouTube link. Videos are optional.
          </p>
        </div>
        {!pendingMedia && (
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "upload" ? null : "upload");
                setSubmitError(null);
              }}
              disabled={saving}
              className="font-sans text-body-s underline underline-offset-4 hover:text-heritage-green disabled:opacity-50"
            >
              {mode === "upload" ? "Close upload" : "Upload video"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "youtube" ? null : "youtube");
                setSubmitError(null);
              }}
              disabled={saving}
              className="font-sans text-body-s underline underline-offset-4 hover:text-heritage-green disabled:opacity-50"
            >
              {mode === "youtube" ? "Close YouTube form" : "Add YouTube link"}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <p role="status" className="mt-5 font-sans text-body-s text-muted">
          Loading event videos…
        </p>
      )}
      {loadError && (
        <div role="alert" className="mt-5">
          <p className="font-sans text-body-s text-error">
            Couldn’t load the event videos. {loadError}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 font-sans text-body-s underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <ul className="mt-6 space-y-6">
          {videos.map((item) => (
            <li key={item.attachment_id} className="border-t border-line pt-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <VideoPreview media={item} />
                  <h3 className="mt-3 font-display text-heading-s">
                    {item.title}
                  </h3>
                  {(item.caption || item.source_credit || item.license) && (
                    <div className="mt-2 space-y-1 font-sans text-body-s text-muted">
                      {item.caption && <p>{item.caption}</p>}
                      {item.source_credit && (
                        <p>Credit: {item.source_credit}</p>
                      )}
                      {item.license && <p>License: {item.license}</p>}
                    </div>
                  )}
                  <p className="mt-2 font-sans text-meta capitalize text-muted">
                    {item.video_provider === "youtube"
                      ? "YouTube"
                      : "Uploaded video"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeVideo(item.attachment_id)}
                  disabled={saving}
                  className="self-start font-sans text-body-s text-error underline underline-offset-4 disabled:opacity-50"
                >
                  Remove from event
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !loadError && videos.length === 0 && !pendingMedia && (
        <p className="mt-5 font-sans text-body-s text-muted">
          No videos attached to this event.
        </p>
      )}

      {pendingMedia && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 font-sans text-body-s text-muted">
            This video is saved, but is not attached yet.
          </p>
          <VideoPreview media={pendingMedia} />
          {submitError && (
            <p role="alert" className="mt-3 font-sans text-body-s text-error">
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void retryAttach()}
            disabled={saving}
            className="mt-4 h-10 bg-heritage-green px-5 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest disabled:opacity-60"
          >
            {saving ? "Attaching…" : "Retry attachment"}
          </button>
        </div>
      )}

      {!pendingMedia && mode === "youtube" && (
        <form onSubmit={submitYouTube} className="mt-6 space-y-4 border-t border-line pt-5">
          <label className="block">
            <span className={labelClass}>YouTube video URL *</span>
            <input
              type="url"
              required
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={fieldClass}
            />
            <span className="mt-1.5 block font-sans text-meta text-muted">
              Paste a YouTube watch, short, shorts, live, or embed link.
            </span>
          </label>
          {renderMetadataFields()}
          {submitError && (
            <p role="alert" className="font-sans text-body-s text-error">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add YouTube video"}
          </button>
        </form>
      )}

      {!pendingMedia && mode === "upload" && (
        <form onSubmit={submitUpload} className="mt-6 space-y-4 border-t border-line pt-5">
          <label className="block">
            <span className={labelClass}>Video file *</span>
            <input
              type="file"
              accept=".mp4,.webm,video/mp4,video/webm"
              onChange={(event) => chooseFile(event.currentTarget.files?.[0])}
              aria-invalid={Boolean(fileError)}
              className="block w-full border border-line bg-transparent px-3 py-2 font-sans text-body-s file:mr-4 file:border-0 file:bg-heritage-green file:px-3 file:py-2 file:font-sans file:text-body-s file:text-ivory"
            />
            <span className="mt-1.5 block font-sans text-meta text-muted">
              MP4 or WebM. Maximum 10 MB.
            </span>
          </label>
          {fileError && (
            <p role="alert" className="font-sans text-body-s text-error">
              {fileError}
            </p>
          )}
          {renderMetadataFields()}
          {uploadProgress !== null && saving && (
            <p role="status" className="font-sans text-body-s text-muted">
              Uploading video… {uploadProgress}%
            </p>
          )}
          {submitError && (
            <p role="alert" className="font-sans text-body-s text-error">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest disabled:opacity-60"
          >
            {saving ? "Uploading…" : "Upload and attach"}
          </button>
        </form>
      )}
    </section>
  );
}
