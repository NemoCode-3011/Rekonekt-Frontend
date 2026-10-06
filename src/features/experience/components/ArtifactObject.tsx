import { toParagraphs } from "../../../lib/text";
import SaveButton from "../../bookmarks/components/SaveButton";
import type { ArtifactWithMedia } from "../types";
import ArtifactMedia from "./ArtifactMedia";

interface ArtifactObjectProps {
  artifact: ArtifactWithMedia;
  // When true the object sits on the right and the label on the left.
  // The gallery alternates this so the page has a rhythm.
  mirrored: boolean;
}

// One museum object: the object itself next to its wall label.
function ArtifactObject({ artifact, mirrored }: ArtifactObjectProps) {
  const hasMedia = artifact.media.length > 0;
  const description = toParagraphs(artifact.description);
  const context = toParagraphs(artifact.historical_context);

  return (
    <article className="grid gap-10 py-16 md:grid-cols-12 md:items-center md:gap-14 md:py-24">
      {hasMedia && (
        <div className={`md:col-span-7 ${mirrored ? "md:order-last" : ""}`}>
          <ArtifactMedia media={artifact.media} />
        </div>
      )}

      {/* The wall label. With no file attached it stands on its own. */}
      <div className={hasMedia ? "md:col-span-5" : "max-w-2xl md:col-span-12"}>
        {artifact.date_display && (
          <p className="font-display text-heading-s text-sand">
            {artifact.date_display}
          </p>
        )}

        <h3 className="mt-3 font-display text-heading-l leading-[1.05]">
          {artifact.title}
        </h3>

        {artifact.artifact_type && (
          <p className="mt-3 font-sans text-body-s text-ivory/60">
            {artifact.artifact_type}
          </p>
        )}

        {description.map((paragraph, index) => (
          <p
            key={index}
            className="mt-6 max-w-[34rem] font-sans text-body-m leading-[1.75] text-ivory/85"
          >
            {paragraph}
          </p>
        ))}

        {context.length > 0 && (
          <div className="mt-8 max-w-[34rem] border-t border-line-light pt-6">
            <h4 className="font-sans text-body-s font-medium text-sand">
              Historical context
            </h4>
            {context.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 font-sans text-body-m leading-[1.75] text-ivory/70"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <div className="mt-8">
          <SaveButton artifactId={artifact.id} tone="dark" />
        </div>
      </div>
    </article>
  );
}

export default ArtifactObject;