import { useState } from "react";
import type { ExperienceMedia } from "../types";
import ImageLightbox from "./ImageLightbox";

type MediaKind = "picture" | "pdf" | "video" | "audio" | "file";

// Decides how to show a file, using its type and its web address.
function kindOf(media: ExperienceMedia): MediaKind {
  if (media.media_type === "video") return "video";
  if (media.media_type === "audio") return "audio";
  if (/\.pdf(\?|#|$)/i.test(media.file_url)) return "pdf";
  if (
    media.media_type === "image" ||
    /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(media.file_url)
  ) {
    return "picture";
  }
  return "file";
}

// The large display of one file.
function MediaStage({ media }: { media: ExperienceMedia }) {
  const [zoomed, setZoomed] = useState(false);
  const kind = kindOf(media);

  if (kind === "picture") {
    return (
      <>
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`Look closer at ${media.title}`}
          className="group relative block w-full cursor-zoom-in bg-ink/30 p-4 md:p-8"
        >
          <img
            src={media.file_url}
            alt={media.title}
            className="mx-auto max-h-[70svh] w-auto max-w-full object-contain shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
          />
          {/* Always visible on touch screens, on hover or focus on desktop */}
          <span className="absolute bottom-3 right-3 bg-ink/70 px-3 py-1 font-sans text-label text-ivory md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            Look closer
          </span>
        </button>

        {zoomed && (
          <ImageLightbox
            src={media.file_url}
            alt={media.title}
            caption={media.caption}
            onClose={() => setZoomed(false)}
          />
        )}
      </>
    );
  }

  if (kind === "video") {
    return <video controls src={media.file_url} className="w-full bg-ink" />;
  }

  if (kind === "audio") {
    return <audio controls src={media.file_url} className="w-full" />;
  }

  // PDFs and any other file: a paper-style sheet that opens the file.
  return (
    <div className="mx-auto flex aspect-[3/4] max-w-xs flex-col justify-between bg-sand p-8 text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
      <div>
        <p className="font-display text-heading-s leading-tight">
          {media.title}
        </p>
        <p className="mt-2 font-sans text-body-s text-ink/70">
          {kind === "pdf" ? "PDF document" : "Document"}
        </p>
      </div>

      <a
        href={media.file_url}
        target="_blank"
        rel="noreferrer"
        className="self-start border-b border-ink font-sans text-body-m font-medium"
      >
        Open document
      </a>
    </div>
  );
}

// Everything that shows an artifact's files: the large display, the caption
// and credit, and small thumbnails when there is more than one file.
function ArtifactMedia({ media }: { media: ExperienceMedia[] }) {
  const [selected, setSelected] = useState(0);
  const current = media[selected];

  return (
    <div>
      {/* The key makes the zoom state start fresh for each file */}
      <MediaStage key={current.id} media={current} />

      <div className="mt-4 space-y-1 font-sans text-body-s leading-relaxed text-ivory/65">
        {current.caption && <p>{current.caption}</p>}
        {current.source_credit && <p>Credit: {current.source_credit}</p>}
        {current.license && <p>License: {current.license}</p>}
      </div>

      {media.length > 1 && (
        <ul className="mt-6 flex flex-wrap gap-3" aria-label="More views">
          {media.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show ${item.title}`}
                aria-current={index === selected ? "true" : undefined}
                className={`block size-16 overflow-hidden border md:size-20 ${
                  index === selected
                    ? "border-ivory"
                    : "border-line-light opacity-60 hover:opacity-100"
                }`}
              >
                {kindOf(item) === "picture" ? (
                  <img
                    src={item.file_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center px-1 text-center font-sans text-label text-ivory">
                    Document
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArtifactMedia;
